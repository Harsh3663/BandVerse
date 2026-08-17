import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import * as OTPAuth from "otpauth";

import { conflictError, unauthorizedError, validationError } from "@/backend/shared/errors";
import { writeImmutableAudit } from "@/backend/infrastructure/audit/audit-framework";

export interface MfaSetupResult {
  readonly secret: string;
  readonly otpauthUrl: string;
  readonly backupCodes: readonly string[];
}

export interface MfaStatus {
  readonly enabled: boolean;
  readonly enabledAt?: string;
  readonly backupCodesRemaining: number;
  readonly trustedDeviceCount: number;
}

export interface MfaService {
  getStatus(userId: string): Promise<MfaStatus>;
  beginSetup(userId: string, email: string): Promise<MfaSetupResult>;
  enable(userId: string, code: string): Promise<MfaStatus>;
  disable(userId: string, code: string): Promise<MfaStatus>;
  verify(userId: string, code: string): Promise<boolean>;
  trustDevice(input: {
    userId: string;
    fingerprint: string;
    label?: string;
  }): Promise<{ deviceId: string }>;
  listTrustedDevices(userId: string): Promise<
    readonly {
      id: string;
      fingerprint: string;
      label?: string;
      lastSeenAt: string;
      trustedAt: string;
    }[]
  >;
  revokeTrustedDevice(userId: string, deviceId: string): Promise<boolean>;
}

interface MemoryMfaState {
  secret?: string;
  enabled: boolean;
  enabledAt?: string;
  pendingSecret?: string;
  backupCodeHashes: string[];
  trustedDevices: {
    id: string;
    fingerprint: string;
    label?: string;
    lastSeenAt: string;
    trustedAt: string;
    revokedAt?: string;
  }[];
}

function hashCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function mfaKey(): Buffer {
  const material =
    process.env.MFA_ENCRYPTION_KEY ??
    process.env.JWT_SECRET ??
    "bandverse-dev-only-secret-change-me";
  return createHash("sha256").update(material).digest();
}

/** AES-256-GCM; format v1.iv.tag.ciphertext (base64url). */
function encryptSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", mfaKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

function decryptSecret(encrypted: string): string {
  const parts = encrypted.split(".");
  if (parts[0] === "v1" && parts.length === 4) {
    const [, ivB64, tagB64, dataB64] = parts;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      mfaKey(),
      Buffer.from(ivB64!, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagB64!, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64!, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }
  throw unauthorizedError("Invalid MFA secret encoding.");
}

function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(4).toString("hex").toUpperCase(),
  );
}

function verifyTotp(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: "BandVerse",
    label: "BandVerse",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.validate({ token: code.replace(/\s/g, ""), window: 1 }) !== null;
}

/** In-memory MFA for mock/CI; Prisma-backed service used when DATABASE_URL is set. */
export function createMemoryMfaService(): MfaService {
  const store = new Map<string, MemoryMfaState>();

  function state(userId: string): MemoryMfaState {
    const existing = store.get(userId);
    if (existing) return existing;
    const created: MemoryMfaState = {
      enabled: false,
      backupCodeHashes: [],
      trustedDevices: [],
    };
    store.set(userId, created);
    return created;
  }

  return {
    async getStatus(userId) {
      const current = state(userId);
      return {
        enabled: current.enabled,
        enabledAt: current.enabledAt,
        backupCodesRemaining: current.backupCodeHashes.length,
        trustedDeviceCount: current.trustedDevices.filter((d) => !d.revokedAt).length,
      };
    },

    async beginSetup(userId, email) {
      const secret = new OTPAuth.Secret({ size: 20 }).base32;
      const current = state(userId);
      current.pendingSecret = secret;
      const totp = new OTPAuth.TOTP({
        issuer: "BandVerse",
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });
      const backupCodes = generateBackupCodes();
      current.backupCodeHashes = backupCodes.map(hashCode);
      return {
        secret,
        otpauthUrl: totp.toString(),
        backupCodes,
      };
    },

    async enable(userId, code) {
      const current = state(userId);
      if (!current.pendingSecret) {
        throw validationError("MFA setup has not been started.");
      }
      if (!verifyTotp(current.pendingSecret, code)) {
        throw unauthorizedError("Invalid MFA code.");
      }
      current.secret = current.pendingSecret;
      current.pendingSecret = undefined;
      current.enabled = true;
      current.enabledAt = new Date().toISOString();
      await writeImmutableAudit(undefined, {
        actorUserId: userId,
        action: "mfa.enable",
        resource: "user",
        resourceId: userId,
        after: { mfaEnabled: true },
      });
      return this.getStatus(userId);
    },

    async disable(userId, code) {
      const current = state(userId);
      if (!current.enabled || !current.secret) {
        throw conflictError("MFA is not enabled.");
      }
      const ok =
        verifyTotp(current.secret, code) ||
        current.backupCodeHashes.includes(hashCode(code));
      if (!ok) throw unauthorizedError("Invalid MFA code.");
      current.enabled = false;
      current.secret = undefined;
      current.enabledAt = undefined;
      current.backupCodeHashes = [];
      await writeImmutableAudit(undefined, {
        actorUserId: userId,
        action: "mfa.disable",
        resource: "user",
        resourceId: userId,
        after: { mfaEnabled: false },
      });
      return this.getStatus(userId);
    },

    async verify(userId, code) {
      const current = state(userId);
      if (!current.enabled || !current.secret) return true;
      if (verifyTotp(current.secret, code)) return true;
      const index = current.backupCodeHashes.indexOf(hashCode(code));
      if (index >= 0) {
        current.backupCodeHashes.splice(index, 1);
        return true;
      }
      return false;
    },

    async trustDevice(input) {
      const current = state(input.userId);
      const existing = current.trustedDevices.find(
        (device) => device.fingerprint === input.fingerprint && !device.revokedAt,
      );
      if (existing) {
        existing.lastSeenAt = new Date().toISOString();
        existing.label = input.label ?? existing.label;
        return { deviceId: existing.id };
      }
      const device = {
        id: `dev_${randomBytes(8).toString("hex")}`,
        fingerprint: input.fingerprint,
        label: input.label,
        lastSeenAt: new Date().toISOString(),
        trustedAt: new Date().toISOString(),
      };
      current.trustedDevices.push(device);
      return { deviceId: device.id };
    },

    async listTrustedDevices(userId) {
      return state(userId)
        .trustedDevices.filter((device) => !device.revokedAt)
        .map((device) => ({
          id: device.id,
          fingerprint: device.fingerprint,
          label: device.label,
          lastSeenAt: device.lastSeenAt,
          trustedAt: device.trustedAt,
        }));
    },

    async revokeTrustedDevice(userId, deviceId) {
      const device = state(userId).trustedDevices.find((item) => item.id === deviceId);
      if (!device || device.revokedAt) return false;
      device.revokedAt = new Date().toISOString();
      return true;
    },
  };
}

export function createPrismaMfaService(
  prisma: import("@prisma/client").PrismaClient,
): MfaService {
  const memory = createMemoryMfaService();

  return {
    async getStatus(userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          mfaBackupCodes: { where: { usedAt: null } },
          trustedDevices: { where: { revokedAt: null } },
        },
      });
      if (!user) return memory.getStatus(userId);
      return {
        enabled: user.mfaEnabled,
        enabledAt: user.mfaEnabledAt?.toISOString(),
        backupCodesRemaining: user.mfaBackupCodes.length,
        trustedDeviceCount: user.trustedDevices.length,
      };
    },

    async beginSetup(userId, email) {
      const setup = await memory.beginSetup(userId, email);
      // Persist pending secret encrypted for restart safety in memory bridge.
      await prisma.user.update({
        where: { id: userId },
        data: { mfaSecretEncrypted: encryptSecret(setup.secret) },
      });
      await prisma.mfaBackupCode.deleteMany({ where: { userId } });
      await prisma.mfaBackupCode.createMany({
        data: setup.backupCodes.map((code) => ({
          userId,
          codeHash: hashCode(code),
        })),
      });
      return setup;
    },

    async enable(userId, code) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.mfaSecretEncrypted) {
        throw validationError("MFA setup has not been started.");
      }
      const secret = decryptSecret(user.mfaSecretEncrypted);
      if (!verifyTotp(secret, code)) throw unauthorizedError("Invalid MFA code.");
      await prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true, mfaEnabledAt: new Date() },
      });
      await writeImmutableAudit(prisma, {
        actorUserId: userId,
        action: "mfa.enable",
        resource: "user",
        resourceId: userId,
        before: { mfaEnabled: false },
        after: { mfaEnabled: true },
      });
      return this.getStatus(userId);
    },

    async disable(userId, code) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { mfaBackupCodes: { where: { usedAt: null } } },
      });
      if (!user?.mfaEnabled || !user.mfaSecretEncrypted) {
        throw conflictError("MFA is not enabled.");
      }
      const secret = decryptSecret(user.mfaSecretEncrypted);
      const backup = user.mfaBackupCodes.find(
        (entry) => entry.codeHash === hashCode(code),
      );
      if (!verifyTotp(secret, code) && !backup) {
        throw unauthorizedError("Invalid MFA code.");
      }
      if (backup) {
        await prisma.mfaBackupCode.update({
          where: { id: backup.id },
          data: { usedAt: new Date() },
        });
      }
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaEnabledAt: null,
          mfaSecretEncrypted: null,
        },
      });
      await prisma.mfaBackupCode.deleteMany({ where: { userId } });
      await writeImmutableAudit(prisma, {
        actorUserId: userId,
        action: "mfa.disable",
        resource: "user",
        resourceId: userId,
        before: { mfaEnabled: true },
        after: { mfaEnabled: false },
      });
      return this.getStatus(userId);
    },

    async verify(userId, code) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { mfaBackupCodes: { where: { usedAt: null } } },
      });
      if (!user?.mfaEnabled || !user.mfaSecretEncrypted) return true;
      const secret = decryptSecret(user.mfaSecretEncrypted);
      if (verifyTotp(secret, code)) return true;
      const backup = user.mfaBackupCodes.find(
        (entry) => entry.codeHash === hashCode(code),
      );
      if (!backup) return false;
      await prisma.mfaBackupCode.update({
        where: { id: backup.id },
        data: { usedAt: new Date() },
      });
      return true;
    },

    async trustDevice(input) {
      const device = await prisma.trustedDevice.upsert({
        where: {
          userId_fingerprint: {
            userId: input.userId,
            fingerprint: input.fingerprint,
          },
        },
        update: {
          label: input.label,
          lastSeenAt: new Date(),
          revokedAt: null,
        },
        create: {
          userId: input.userId,
          fingerprint: input.fingerprint,
          label: input.label,
        },
      });
      return { deviceId: device.id };
    },

    async listTrustedDevices(userId) {
      const devices = await prisma.trustedDevice.findMany({
        where: { userId, revokedAt: null },
        orderBy: { lastSeenAt: "desc" },
      });
      return devices.map((device) => ({
        id: device.id,
        fingerprint: device.fingerprint,
        label: device.label ?? undefined,
        lastSeenAt: device.lastSeenAt.toISOString(),
        trustedAt: device.trustedAt.toISOString(),
      }));
    },

    async revokeTrustedDevice(userId, deviceId) {
      const result = await prisma.trustedDevice.updateMany({
        where: { id: deviceId, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return result.count > 0;
    },
  };
}
