import { PermissionAction, PermissionResource, RoleName } from "@/backend/domain/enums";
import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { forbiddenError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

/** Internal/admin worker kick for in-process job queue. */
export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/jobs/process");
    return jsonError(auth.error, requestId);
  }

  const allowed =
    auth.value.roles.includes(RoleName.ADMIN) ||
    auth.value.permissions.includes(
      `${PermissionResource.ADMIN}:${PermissionAction.MANAGE}`,
    );
  if (!allowed) {
    finish(403, "/api/v1/jobs/process");
    return jsonError(forbiddenError(), requestId);
  }

  const processed = await container.jobs.processDue(50);
  finish(200, "/api/v1/jobs/process");
  return jsonOk({ processed }, { requestId });
}
