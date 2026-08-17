import { getVenueByIdUseCase } from "@/backend/application/use-cases/venues";
import { asWritableRepositories } from "@/backend/application/ports/writable";
import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import {
  clientMeta,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { fromResult, jsonError, jsonOk } from "@/backend/presentation/http/response";
import { idParamSchema, venueCreateSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const params = await context.params;
  const parsed = parseWithSchema(idParamSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/venues/:id");
    return jsonError(parsed.error, requestId);
  }
  const result = await getVenueByIdUseCase(
    container.repositories.venues,
    parsed.value.id,
  );
  finish(result.ok ? 200 : result.error.status, "/api/v1/venues/:id");
  return fromResult(result, { requestId });
}

export async function PUT(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/venues/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const auth = await requirePermission(
    request,
    PermissionResource.VENUE,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/venues/:id");
    return jsonError(auth.error, requestId);
  }

  const existing = await getVenueByIdUseCase(
    container.repositories.venues,
    parsedParams.value.id,
  );
  if (!existing.ok) {
    finish(404, "/api/v1/venues/:id");
    return jsonError(existing.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/venues/:id");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(venueCreateSchema.partial(), body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/venues/:id");
    return jsonError(parsed.error, requestId);
  }

  const next = {
    ...existing.value,
    ...parsed.value,
    location: parsed.value.location ?? existing.value.location,
    capacity: parsed.value.capacity ?? existing.value.capacity,
    amenityIds: parsed.value.amenityIds ?? existing.value.amenityIds,
    preferredGenreIds:
      parsed.value.preferredGenreIds ?? existing.value.preferredGenreIds,
    preferredEventTypeIds:
      parsed.value.preferredEventTypeIds ?? existing.value.preferredEventTypeIds,
  };

  const repos = asWritableRepositories(container.repositories);
  const updated = await repos.venues.update(parsedParams.value.id, next);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "update",
    resource: PermissionResource.VENUE,
    resourceId: updated.id,
    ...clientMeta(request),
  });
  finish(200, "/api/v1/venues/:id");
  return jsonOk(updated, { requestId });
}
