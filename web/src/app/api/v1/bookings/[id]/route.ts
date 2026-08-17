import {
  getBookingByIdUseCase,
  transitionBookingCommand,
} from "@/backend/application/use-cases/bookings";
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
  bookingStatusUpdateSchema,
  idParamSchema,
} from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function bookingPartyUserIds(
  container: Awaited<ReturnType<typeof withRequestContext>>["container"],
  booking: { hostId: string; performerId: string },
): Promise<string[]> {
  const parties = [booking.hostId];
  if (container.prisma) {
    const performer = await container.prisma.performer.findFirst({
      where: { id: booking.performerId, deletedAt: null },
      select: { userId: true },
    });
    if (performer?.userId) parties.push(performer.userId);
  } else {
    parties.push(booking.performerId);
  }
  return parties;
}

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.BOOKING,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/bookings/:id");
    return jsonError(auth.error, requestId);
  }

  const params = await context.params;
  const parsed = parseWithSchema(idParamSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/bookings/:id");
    return jsonError(parsed.error, requestId);
  }

  const result = await getBookingByIdUseCase(
    container.repositories.bookings,
    parsed.value.id,
  );
  if (!result.ok) {
    finish(result.error.status, "/api/v1/bookings/:id");
    return fromResult(result, { requestId });
  }
  const owned = assertOwnership(
    auth.value,
    await bookingPartyUserIds(container, result.value),
  );
  if (!owned.ok) {
    finish(403, "/api/v1/bookings/:id");
    return jsonError(owned.error, requestId);
  }
  finish(200, "/api/v1/bookings/:id");
  return fromResult(result, { requestId });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.BOOKING,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/bookings/:id");
    return jsonError(auth.error, requestId);
  }

  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/bookings/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const existing = await getBookingByIdUseCase(
    container.repositories.bookings,
    parsedParams.value.id,
  );
  if (!existing.ok) {
    finish(404, "/api/v1/bookings/:id");
    return jsonError(existing.error, requestId);
  }

  const owned = assertOwnership(
    auth.value,
    await bookingPartyUserIds(container, existing.value),
  );
  if (!owned.ok) {
    finish(403, "/api/v1/bookings/:id");
    return jsonError(owned.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/bookings/:id");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(bookingStatusUpdateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/bookings/:id");
    return jsonError(parsed.error, requestId);
  }

  const transitioned = transitionBookingCommand(
    existing.value,
    parsed.value.status,
    parsed.value.cancellationReason,
  );
  if (!transitioned.ok) {
    finish(transitioned.error.status, "/api/v1/bookings/:id");
    return jsonError(transitioned.error, requestId);
  }

  const repos = asWritableRepositories(container.repositories);
  const updated = await repos.bookings.update(transitioned.value);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "update",
    resource: PermissionResource.BOOKING,
    resourceId: updated.id,
    metadata: { status: updated.status },
    before: { status: existing.value.status },
    after: { status: updated.status },
    ...clientMeta(request),
  });
  if (updated.status === "confirmed") {
    await container.eventBus.publish(
      "BookingConfirmed",
      {
        bookingId: updated.id,
        eventId: updated.eventId,
        performerId: updated.performerId,
        hostId: updated.hostId,
      },
      requestId,
    );
  }
  await container.swrCache.publishInvalidation(["bookings"]);
  finish(200, "/api/v1/bookings/:id");
  return jsonOk(updated, { requestId });
}
