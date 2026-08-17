import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { idParamSchema } from "@/backend/shared/validation/schemas";
import { notFoundError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/sessions/:id");
    return jsonError(auth.error, requestId);
  }

  const params = await context.params;
  const parsed = parseWithSchema(idParamSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/auth/sessions/:id");
    return jsonError(parsed.error, requestId);
  }

  const revoked = await container.sessions.revokeSession(
    auth.value.userId,
    parsed.value.id,
  );
  if (!revoked) {
    finish(404, "/api/v1/auth/sessions/:id");
    return jsonError(notFoundError("Session", parsed.value.id), requestId);
  }

  finish(200, "/api/v1/auth/sessions/:id");
  return jsonOk({ success: true }, { requestId });
}
