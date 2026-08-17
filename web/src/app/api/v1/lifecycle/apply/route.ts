import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toLifecycleError } from "@/backend/presentation/http/lifecycle-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  eventId: entityIdSchema,
  performerId: entityIdSchema,
  hostId: entityIdSchema.optional(),
  message: z.string().trim().min(1).max(2000),
  quotedPaise: z.number().int().positive(),
});

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.APPLICATION,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/lifecycle/apply");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/lifecycle/apply");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(schema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/lifecycle/apply");
    return jsonError(parsed.error, requestId);
  }

  try {
    const lifecycle = await container.lifecycle.apply({
      ...parsed.value,
      hostId: parsed.value.hostId ?? "",
      actorUserId: auth.value.userId,
    });
    finish(201, "/api/v1/lifecycle/apply");
    return jsonOk(lifecycle, { status: 201, requestId });
  } catch (error) {
    const appError = toLifecycleError(error);
    finish(appError.status, "/api/v1/lifecycle/apply");
    return jsonError(appError, requestId);
  }
}
