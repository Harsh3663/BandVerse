import { listEventsUseCase } from "@/backend/application/use-cases/events";
import { asWritableRepositories } from "@/backend/application/ports/writable";
import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import {
  parseJsonBody,
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import {
  clientMeta,
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { fromResult, jsonError, jsonOk } from "@/backend/presentation/http/response";
import {
  eventCreateSchema,
  eventQuerySchema,
} from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/events");
    return limited;
  }

  const parsed = parseWithSchema(
    eventQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/events");
    return jsonError(parsed.error, requestId);
  }

  const result = await listEventsUseCase(container.repositories.events, parsed.value);
  if (!result.ok) {
    finish(result.error.status, "/api/v1/events");
    return jsonError(result.error, requestId);
  }
  finish(200, "/api/v1/events");
  return fromResult(
    { ok: true, value: result.value.items },
    { meta: result.value.meta, requestId },
  );
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.EVENT,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/events");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/events");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(eventCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/events");
    return jsonError(parsed.error, requestId);
  }

  const repos = asWritableRepositories(container.repositories);
  const created = await repos.events.create(auth.value.userId, parsed.value);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "create",
    resource: PermissionResource.EVENT,
    resourceId: created.id,
    after: { status: created.status },
    ...clientMeta(request),
  });
  if (created.status === "published") {
    await container.eventBus.publish(
      "EventPublished",
      { eventId: created.id, organizerId: auth.value.userId },
      requestId,
    );
  }
  await container.swrCache.publishInvalidation(["events", "search"]);
  finish(201, "/api/v1/events");
  return jsonOk(created, { status: 201, requestId });
}
