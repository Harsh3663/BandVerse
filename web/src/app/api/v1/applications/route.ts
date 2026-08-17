import { listApplicationsUseCase } from "@/backend/application/use-cases/applications";
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
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { fromResult, jsonError, jsonOk } from "@/backend/presentation/http/response";
import {
  applicationCreateSchema,
  applicationQuerySchema,
} from "@/backend/shared/validation/schemas";
import type { Application } from "@/modules/marketplace/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.APPLICATION,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/applications");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(
    applicationQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/applications");
    return jsonError(parsed.error, requestId);
  }

  const result = await listApplicationsUseCase(
    container.repositories.applications,
    parsed.value,
  );
  if (!result.ok) {
    finish(result.error.status, "/api/v1/applications");
    return jsonError(result.error, requestId);
  }
  finish(200, "/api/v1/applications");
  return fromResult(
    { ok: true, value: result.value.items },
    { meta: result.value.meta, requestId },
  );
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.APPLICATION,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/applications");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/applications");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(applicationCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/applications");
    return jsonError(parsed.error, requestId);
  }

  const now = new Date().toISOString();
  const application: Application = {
    id: `application_${crypto.randomUUID()}`,
    eventId: parsed.value.eventId,
    performerId: parsed.value.performerId,
    proposedPackageId: parsed.value.proposedPackageId,
    quotedPrice: parsed.value.quotedPrice,
    message: parsed.value.message,
    status: "submitted",
    submittedAt: now,
    updatedAt: now,
  };

  const repos = asWritableRepositories(container.repositories);
  const created = await repos.applications.create(application);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "create",
    resource: PermissionResource.APPLICATION,
    resourceId: created.id,
    ...clientMeta(request),
  });
  finish(201, "/api/v1/applications");
  return jsonOk(created, { status: 201, requestId });
}
