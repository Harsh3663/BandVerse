import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import { authTokenTtl } from "@/backend/infrastructure/security/auth-service";
import {
  assertNotBruteForced,
  clearAuthFailures,
  recordAuthFailure,
} from "@/backend/infrastructure/security/brute-force";
import { setRefreshCookie } from "@/backend/infrastructure/security/cookies";
import { setCsrfCookie } from "@/backend/infrastructure/security/csrf";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import {
  clientMeta,
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { createAppError, unauthorizedError } from "@/backend/shared/errors";
import { authLoginSchema } from "@/backend/shared/validation/schemas";
import { payloadLimits } from "@/backend/presentation/http/api-governance";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "auth", requestId);
  if (limited) {
    finish(429, "/api/v1/auth/login");
    return limited;
  }

  const body = await parseJsonBody(request, payloadLimits.authJsonBytes);
  if (!body.ok) {
    finish(400, "/api/v1/auth/login");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(authLoginSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/auth/login");
    return jsonError(parsed.error, requestId);
  }

  const bruteKey = `${parsed.value.email}:${request.headers.get("x-forwarded-for") ?? "local"}`;
  try {
    assertNotBruteForced(bruteKey);
  } catch (error) {
    finish(429, "/api/v1/auth/login");
    return jsonError(
      error && typeof error === "object" && "code" in error
        ? (error as ReturnType<typeof createAppError>)
        : createAppError("RATE_LIMITED", "Too many failed login attempts."),
      requestId,
    );
  }

  try {
    const result = await container.auth.login(
      parsed.value.email,
      parsed.value.password,
    );

    if (result.status === "mfa_required") {
      clearAuthFailures(bruteKey);
      finish(200, "/api/v1/auth/login");
      return jsonOk(
        {
          mfaRequired: true as const,
          mfaChallengeToken: result.mfaChallengeToken,
          expiresIn: result.expiresIn,
          user: result.user,
        },
        { requestId },
      );
    }

    clearAuthFailures(bruteKey);
    await writeAuditLog(container.prisma, {
      actorUserId: result.user.id,
      action: "login",
      resource: "session",
      resourceId: result.context.sessionId,
      ...clientMeta(request),
    });
    incrementMetric("auth_logins_total");
    const response = jsonOk(
      {
        accessToken: result.accessToken,
        tokenType: "Bearer" as const,
        expiresIn: result.expiresIn,
        user: result.user,
      },
      { requestId },
    );
    setRefreshCookie(response, result.refreshToken, authTokenTtl.refreshTtlSeconds);
    setCsrfCookie(response);
    finish(200, "/api/v1/auth/login");
    return response;
  } catch {
    recordAuthFailure(bruteKey);
    incrementMetric("auth_failures_total");
    finish(401, "/api/v1/auth/login");
    return jsonError(unauthorizedError("Invalid credentials."), requestId);
  }
}
