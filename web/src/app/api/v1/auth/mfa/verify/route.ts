import { authTokenTtl } from "@/backend/infrastructure/security/auth-service";
import { setRefreshCookie } from "@/backend/infrastructure/security/cookies";
import { setCsrfCookie } from "@/backend/infrastructure/security/csrf";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { extractBearerToken, requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { unauthorizedError } from "@/backend/shared/errors";
import { jwtVerify } from "jose";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().min(6).max(16),
  mfaChallengeToken: z.string().trim().min(20).optional(),
  trustDevice: z.boolean().optional(),
  deviceFingerprint: z.string().trim().min(8).max(200).optional(),
  deviceLabel: z.string().trim().max(120).optional(),
});

function jwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "bandverse-dev-only-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/auth/mfa/verify");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(schema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/auth/mfa/verify");
    return jsonError(parsed.error, requestId);
  }

  // Login completion path: challenge token + code → full session (no prior access token).
  if (parsed.value.mfaChallengeToken) {
    let userId: string;
    try {
      const { payload } = await jwtVerify(
        parsed.value.mfaChallengeToken,
        jwtSecret(),
        { issuer: "bandverse", audience: "bandverse-api" },
      );
      if (payload.typ !== "mfa_challenge" || typeof payload.sub !== "string") {
        throw new Error("bad challenge");
      }
      userId = payload.sub;
    } catch {
      finish(401, "/api/v1/auth/mfa/verify");
      return jsonError(unauthorizedError("Invalid MFA challenge."), requestId);
    }

    const ok = await container.mfa.verify(userId, parsed.value.code);
    if (!ok) {
      finish(401, "/api/v1/auth/mfa/verify");
      return jsonError(unauthorizedError("Invalid MFA code."), requestId);
    }

    const tokens = await container.auth.completeMfaLogin(
      parsed.value.mfaChallengeToken,
    );
    if (parsed.value.trustDevice && parsed.value.deviceFingerprint) {
      await container.mfa.trustDevice({
        userId,
        fingerprint: parsed.value.deviceFingerprint,
        label: parsed.value.deviceLabel,
      });
    }

    const response = jsonOk(
      {
        verified: true,
        accessToken: tokens.accessToken,
        tokenType: "Bearer" as const,
        expiresIn: tokens.expiresIn,
        user: tokens.user,
      },
      { requestId },
    );
    setRefreshCookie(response, tokens.refreshToken, authTokenTtl.refreshTtlSeconds);
    setCsrfCookie(response);
    finish(200, "/api/v1/auth/mfa/verify");
    return response;
  }

  // Authenticated step-up path.
  const auth = await requireAuth(request);
  if (!auth.ok) {
    // Avoid unused bearer when challenge missing.
    if (!extractBearerToken(request)) {
      finish(401, "/api/v1/auth/mfa/verify");
      return jsonError(unauthorizedError("MFA challenge or access token required."), requestId);
    }
    finish(401, "/api/v1/auth/mfa/verify");
    return jsonError(auth.error, requestId);
  }

  const ok = await container.mfa.verify(auth.value.userId, parsed.value.code);
  if (!ok) {
    finish(401, "/api/v1/auth/mfa/verify");
    return jsonError(unauthorizedError("Invalid MFA code."), requestId);
  }

  let deviceId: string | undefined;
  if (parsed.value.trustDevice && parsed.value.deviceFingerprint) {
    const trusted = await container.mfa.trustDevice({
      userId: auth.value.userId,
      fingerprint: parsed.value.deviceFingerprint,
      label: parsed.value.deviceLabel,
    });
    deviceId = trusted.deviceId;
  }

  finish(200, "/api/v1/auth/mfa/verify");
  return jsonOk({ verified: true, deviceId }, { requestId });
}
