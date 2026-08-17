import { getEventByIdUseCase } from "@/backend/application/use-cases/events";
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
import { eventCreateSchema, idParamSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const params = await context.params;
  const parsed = parseWithSchema(idParamSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/events/:id");
    return jsonError(parsed.error, requestId);
  }
  const result = await getEventByIdUseCase(
    container.repositories.events,
    parsed.value.id,
  );
  finish(result.ok ? 200 : result.error.status, "/api/v1/events/:id");
  return fromResult(result, { requestId });
}

export async function PUT(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/events/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const auth = await requirePermission(
    request,
    PermissionResource.EVENT,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/events/:id");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/events/:id");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(eventCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/events/:id");
    return jsonError(parsed.error, requestId);
  }

  const repos = asWritableRepositories(container.repositories);
  const updated = await repos.events.update(parsedParams.value.id, parsed.value);
  if (!updated) {
    finish(404, "/api/v1/events/:id");
    return jsonError(
      { code: "NOT_FOUND", message: "Event not found.", status: 404 },
      requestId,
    );
  }
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "update",
    resource: PermissionResource.EVENT,
    resourceId: updated.id,
    after: { status: updated.status },
    ...clientMeta(request),
  });
  if (updated.status === "published") {
    await container.eventBus.publish(
      "EventPublished",
      { eventId: updated.id, organizerId: auth.value.userId },
      requestId,
    );
  }
  await container.swrCache.publishInvalidation(["events", "search"]);
  finish(200, "/api/v1/events/:id");
  return jsonOk(updated, { requestId });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/events/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const auth = await requirePermission(
    request,
    PermissionResource.EVENT,
    PermissionAction.DELETE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/events/:id");
    return jsonError(auth.error, requestId);
  }

  const repos = asWritableRepositories(container.repositories);
  await repos.events.delete(parsedParams.value.id);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "delete",
    resource: PermissionResource.EVENT,
    resourceId: parsedParams.value.id,
    ...clientMeta(request),
  });
  finish(200, "/api/v1/events/:id");
  return jsonOk({ success: true }, { requestId });
}
