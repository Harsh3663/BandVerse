import {
  getApplicationByIdUseCase,
  transitionApplicationCommand,
} from "@/backend/application/use-cases/applications";
import { asWritableRepositories } from "@/backend/application/ports/writable";
import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { assertOwnership } from "@/backend/presentation/http/ownership-guard";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import {
  clientMeta,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { fromResult, jsonError, jsonOk } from "@/backend/presentation/http/response";
import {
  applicationStatusUpdateSchema,
  idParamSchema,
} from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function applicationPartyUserIds(
  container: Awaited<ReturnType<typeof withRequestContext>>["container"],
  application: { performerId: string; eventId: string },
): Promise<string[]> {
  const parties: string[] = [];
  const event = await container.repositories.events.getById(application.eventId);
  if (event?.hostId) parties.push(event.hostId);
  if (container.prisma) {
    const performer = await container.prisma.performer.findFirst({
      where: { id: application.performerId, deletedAt: null },
      select: { userId: true },
    });
    if (performer?.userId) parties.push(performer.userId);
  } else {
    parties.push(application.performerId);
  }
  return parties;
}

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.APPLICATION,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/applications/:id");
    return jsonError(auth.error, requestId);
  }

  const params = await context.params;
  const parsed = parseWithSchema(idParamSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/applications/:id");
    return jsonError(parsed.error, requestId);
  }

  const result = await getApplicationByIdUseCase(
    container.repositories.applications,
    parsed.value.id,
  );
  if (!result.ok) {
    finish(result.error.status, "/api/v1/applications/:id");
    return fromResult(result, { requestId });
  }
  const owned = assertOwnership(
    auth.value,
    await applicationPartyUserIds(container, result.value),
  );
  if (!owned.ok) {
    finish(403, "/api/v1/applications/:id");
    return jsonError(owned.error, requestId);
  }
  finish(200, "/api/v1/applications/:id");
  return fromResult(result, { requestId });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  let auth = await requirePermission(
    request,
    PermissionResource.APPLICATION,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    auth = await requirePermission(
      request,
      PermissionResource.APPLICATION,
      PermissionAction.APPROVE,
    );
    if (!auth.ok) {
      finish(auth.error.status, "/api/v1/applications/:id");
      return jsonError(auth.error, requestId);
    }
  }

  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/applications/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const existing = await getApplicationByIdUseCase(
    container.repositories.applications,
    parsedParams.value.id,
  );
  if (!existing.ok) {
    finish(404, "/api/v1/applications/:id");
    return jsonError(existing.error, requestId);
  }

  const owned = assertOwnership(
    auth.value,
    await applicationPartyUserIds(container, existing.value),
  );
  if (!owned.ok) {
    finish(403, "/api/v1/applications/:id");
    return jsonError(owned.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/applications/:id");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(applicationStatusUpdateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/applications/:id");
    return jsonError(parsed.error, requestId);
  }

  const transitioned = transitionApplicationCommand(
    existing.value,
    parsed.value.status,
  );
  if (!transitioned.ok) {
    finish(transitioned.error.status, "/api/v1/applications/:id");
    return jsonError(transitioned.error, requestId);
  }

  const repos = asWritableRepositories(container.repositories);
  const updated = await repos.applications.update(transitioned.value);
  await writeAuditLog(container.prisma, {
    actorUserId: (auth.ok ? auth.value.userId : undefined),
    action: "update",
    resource: PermissionResource.APPLICATION,
    resourceId: updated.id,
    metadata: { status: updated.status },
    ...clientMeta(request),
  });
  finish(200, "/api/v1/applications/:id");
  return jsonOk(updated, { requestId });
}
