import { authTokenTtl } from "@/backend/infrastructure/security/auth-service";
import {
  readRefreshCookie,
  setRefreshCookie,
} from "@/backend/infrastructure/security/cookies";
import { assertCsrf, setCsrfCookie } from "@/backend/infrastructure/security/csrf";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { forbiddenError, unauthorizedError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const refreshToken = readRefreshCookie(request);

  if (!refreshToken) {
    finish(401, "/api/v1/auth/refresh");
    return jsonError(
      unauthorizedError("Refresh token cookie required."),
      requestId,
    );
  }

  try {
    assertCsrf(request);
  } catch (error) {
    finish(403, "/api/v1/auth/refresh");
    return jsonError(
      error && typeof error === "object" && "status" in error
        ? (error as ReturnType<typeof forbiddenError>)
        : forbiddenError("CSRF token missing."),
      requestId,
    );
  }

  try {
    const tokens = await container.auth.refresh(refreshToken);
    const response = jsonOk(
      {
        accessToken: tokens.accessToken,
        tokenType: "Bearer" as const,
        expiresIn: tokens.expiresIn,
      },
      { requestId },
    );
    setRefreshCookie(response, tokens.refreshToken, authTokenTtl.refreshTtlSeconds);
    setCsrfCookie(response);
    finish(200, "/api/v1/auth/refresh");
    return response;
  } catch {
    finish(401, "/api/v1/auth/refresh");
    return jsonError(unauthorizedError("Invalid refresh token."), requestId);
  }
}
