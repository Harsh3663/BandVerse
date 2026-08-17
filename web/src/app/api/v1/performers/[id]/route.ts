import {
  getPerformerByIdUseCase,
} from "@/backend/application/use-cases/performers";
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
import { idParamSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const performerUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(160).optional(),
  headline: z.string().trim().min(2).max(200).optional(),
  biography: z.string().trim().max(5000).optional(),
  city: z.string().trim().min(1).max(120).optional(),
  state: z.string().trim().min(1).max(120).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(_request);
  const params = await context.params;
  const parsed = parseWithSchema(idParamSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/performers/:id");
    return jsonError(parsed.error, requestId);
  }
  const result = await getPerformerByIdUseCase(
    container.repositories.performers,
    parsed.value.id,
  );
  finish(result.ok ? 200 : result.error.status, "/api/v1/performers/:id");
  return fromResult(result, { requestId });
}

export async function PUT(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/performers/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const existing = await getPerformerByIdUseCase(
    container.repositories.performers,
    parsedParams.value.id,
  );
  if (!existing.ok) {
    finish(404, "/api/v1/performers/:id");
    return jsonError(existing.error, requestId);
  }

  const auth = await requirePermission(
    request,
    PermissionResource.PERFORMER,
    PermissionAction.UPDATE,
    {
      ownerUserId:
        "userId" in existing.value &&
        typeof (existing.value as { userId?: string }).userId === "string"
          ? (existing.value as { userId: string }).userId
          : existing.value.id,
    },
  );
  if (!auth.ok) {
    // Allow self-update when performer id matches user-linked performer in mock/dev.
    const adminAuth = await requirePermission(
      request,
      PermissionResource.PERFORMER,
      PermissionAction.MANAGE,
    );
    if (!adminAuth.ok) {
      finish(auth.error.status, "/api/v1/performers/:id");
      return jsonError(auth.error, requestId);
    }
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/performers/:id");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(performerUpdateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/performers/:id");
    return jsonError(parsed.error, requestId);
  }

  const next = {
    ...existing.value,
    ...parsed.value,
    travel: {
      ...existing.value.travel,
      baseLocation: {
        ...existing.value.travel.baseLocation,
        city: parsed.value.city ?? existing.value.travel.baseLocation.city,
        state: parsed.value.state ?? existing.value.travel.baseLocation.state,
      },
    },
    updatedAt: new Date().toISOString(),
  };

  const repos = asWritableRepositories(container.repositories);
  const updated = await repos.performers.update(parsedParams.value.id, next);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.ok ? auth.value.userId : undefined,
    action: "update",
    resource: PermissionResource.PERFORMER,
    resourceId: updated.id,
    ...clientMeta(request),
  });
  finish(200, "/api/v1/performers/:id");
  return jsonOk(updated, { requestId });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/performers/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const auth = await requirePermission(
    request,
    PermissionResource.PERFORMER,
    PermissionAction.DELETE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/performers/:id");
    return jsonError(auth.error, requestId);
  }

  const repos = asWritableRepositories(container.repositories);
  await repos.performers.softDelete(parsedParams.value.id);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "delete",
    resource: PermissionResource.PERFORMER,
    resourceId: parsedParams.value.id,
    ...clientMeta(request),
  });
  finish(200, "/api/v1/performers/:id");
  return jsonOk({ success: true }, { requestId });
}
