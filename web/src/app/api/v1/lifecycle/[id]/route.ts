import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { idParamSchema } from "@/backend/shared/validation/schemas";
import { notFoundError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.BOOKING,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/lifecycle/:id");
    return jsonError(auth.error, requestId);
  }

  const params = await context.params;
  const parsed = parseWithSchema(idParamSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/lifecycle/:id");
    return jsonError(parsed.error, requestId);
  }

  const lifecycle = await container.lifecycle.getById(parsed.value.id);
  if (!lifecycle) {
    finish(404, "/api/v1/lifecycle/:id");
    return jsonError(notFoundError("Lifecycle", parsed.value.id), requestId);
  }
  const timeline = await container.lifecycle.timeline(lifecycle.id);
  const contract = await container.lifecycle.getContract(lifecycle.id);
  finish(200, "/api/v1/lifecycle/:id");
  return jsonOk({ lifecycle, timeline, contract }, { requestId });
}
