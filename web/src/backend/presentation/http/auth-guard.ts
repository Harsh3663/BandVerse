import type { AuthContext } from "@/backend/application/ports/services";
import type { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { getBackendContainer } from "@/backend/infrastructure/container";
import { forbiddenError, unauthorizedError } from "@/backend/shared/errors";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";
import { jsonError } from "./response";

export function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  if (!header) return undefined;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;
  return token.trim();
}

export async function requireAuth(
  request: Request,
): Promise<Result<AuthContext, AppError>> {
  const token = extractBearerToken(request);
  if (!token) return err(unauthorizedError());
  const container = getBackendContainer();
  const context = await container.auth.getContextFromAccessToken(token);
  if (!context) return err(unauthorizedError("Invalid or expired access token."));
  return ok(context);
}

export async function requirePermission(
  request: Request,
  resource: PermissionResource,
  action: PermissionAction,
  attributes?: Readonly<Record<string, unknown>>,
): Promise<Result<AuthContext, AppError>> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;
  const container = getBackendContainer();
  if (!container.authorization.can(auth.value, resource, action, attributes)) {
    return err(
      forbiddenError(`Missing permission ${resource}:${action}.`),
    );
  }
  return auth;
}

export function unauthorizedResponse(requestId?: string) {
  return jsonError(unauthorizedError(), requestId);
}

export function forbiddenResponse(requestId?: string, message?: string) {
  return jsonError(forbiddenError(message), requestId);
}
