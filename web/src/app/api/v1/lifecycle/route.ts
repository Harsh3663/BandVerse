import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import {
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  hostId: entityIdSchema.optional(),
  performerId: entityIdSchema.optional(),
  eventId: entityIdSchema.optional(),
  status: z.string().trim().optional(),
});

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.BOOKING,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/lifecycle");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(
    querySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/lifecycle");
    return jsonError(parsed.error, requestId);
  }

  const items = await container.lifecycle.list({
    hostId: parsed.value.hostId ?? auth.value.userId,
    performerId: parsed.value.performerId,
    eventId: parsed.value.eventId,
    status: parsed.value.status as never,
  });
  finish(200, "/api/v1/lifecycle");
  return jsonOk(items, { requestId });
}
