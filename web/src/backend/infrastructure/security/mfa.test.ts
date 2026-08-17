import { describe, expect, it } from "vitest";
import * as OTPAuth from "otpauth";

import { createMemoryMfaService } from "./mfa";
import { createMemorySessionService } from "./sessions";

describe("MFA service", () => {
  it("enables TOTP MFA and verifies codes + backup codes", async () => {
    const mfa = createMemoryMfaService();
    const userId = "user_mfa_1";
    const setup = await mfa.beginSetup(userId, "artist@bandverse.test");
    expect(setup.backupCodes.length).toBe(8);

    const totp = new OTPAuth.TOTP({
      issuer: "BandVerse",
      label: "artist@bandverse.test",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(setup.secret),
    });
    const code = totp.generate();
    const enabled = await mfa.enable(userId, code);
    expect(enabled.enabled).toBe(true);

    const nextCode = totp.generate();
    expect(await mfa.verify(userId, nextCode)).toBe(true);
    expect(await mfa.verify(userId, setup.backupCodes[0]!)).toBe(true);
    const status = await mfa.getStatus(userId);
    expect(status.backupCodesRemaining).toBe(7);
  });

  it("tracks trusted devices", async () => {
    const mfa = createMemoryMfaService();
    const userId = "user_mfa_2";
    const trusted = await mfa.trustDevice({
      userId,
      fingerprint: "device-fingerprint-abc12345",
      label: "Studio Laptop",
    });
    const devices = await mfa.listTrustedDevices(userId);
    expect(devices).toHaveLength(1);
    expect(devices[0]?.id).toBe(trusted.deviceId);
    expect(await mfa.revokeTrustedDevice(userId, trusted.deviceId)).toBe(true);
    expect(await mfa.listTrustedDevices(userId)).toHaveLength(0);
  });
});

describe("Session service", () => {
  it("lists and revokes sessions", async () => {
    const sessions = createMemorySessionService();
    sessions.upsert({
      id: "sess_1",
      userId: "user_1",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      lastSeenAt: new Date().toISOString(),
    });
    sessions.upsert({
      id: "sess_2",
      userId: "user_1",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      lastSeenAt: new Date().toISOString(),
    });

    const listed = await sessions.listSessions("user_1", "sess_1");
    expect(listed).toHaveLength(2);
    expect(listed.find((item) => item.id === "sess_1")?.current).toBe(true);

    expect(await sessions.revokeSession("user_1", "sess_2")).toBe(true);
    expect(await sessions.listSessions("user_1")).toHaveLength(1);
    expect(await sessions.revokeAllSessions("user_1")).toBe(1);
    expect(await sessions.listSessions("user_1")).toHaveLength(0);
  });
});
