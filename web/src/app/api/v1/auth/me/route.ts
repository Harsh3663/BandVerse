import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { notFoundError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/me");
    return jsonError(auth.error, requestId);
  }

  const user = await container.auth.getMe(auth.value.userId);
  if (!user) {
    finish(404, "/api/v1/auth/me");
    return jsonError(notFoundError("User", auth.value.userId), requestId);
  }

  finish(200, "/api/v1/auth/me");
  return jsonOk(user, { requestId });
}
