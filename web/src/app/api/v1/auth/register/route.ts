import { PermissionResource } from "@/backend/domain/enums";
import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import { setRefreshCookie } from "@/backend/infrastructure/security/cookies";
import { setCsrfCookie } from "@/backend/infrastructure/security/csrf";
import { authTokenTtl } from "@/backend/infrastructure/security/auth-service";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import {
  clientMeta,
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { createAppError } from "@/backend/shared/errors";
import { authRegisterSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "auth", requestId);
  if (limited) {
    finish(429, "/api/v1/auth/register");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/auth/register");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(authRegisterSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/auth/register");
    return jsonError(parsed.error, requestId);
  }

  try {
    const tokens = await container.auth.register(parsed.value);
    await writeAuditLog(container.prisma, {
      actorUserId: tokens.user.id,
      action: "create",
      resource: PermissionResource.USER,
      resourceId: tokens.user.id,
      ...clientMeta(request),
    });
    incrementMetric("auth_logins_total");
    const response = jsonOk(
      {
        accessToken: tokens.accessToken,
        tokenType: "Bearer" as const,
        expiresIn: tokens.expiresIn,
        user: tokens.user,
      },
      { status: 201, requestId },
    );
    setRefreshCookie(response, tokens.refreshToken, authTokenTtl.refreshTtlSeconds);
    setCsrfCookie(response);
    finish(201, "/api/v1/auth/register");
    return response;
  } catch (error) {
    incrementMetric("auth_failures_total");
    const message = error instanceof Error ? error.message : "Registration failed.";
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: number }).status)
        : 400;
    finish(status, "/api/v1/auth/register");
    return jsonError(
      createAppError(status === 409 ? "CONFLICT" : "VALIDATION_ERROR", message),
      requestId,
    );
  }
}
