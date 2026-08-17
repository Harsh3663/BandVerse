import {
  listBookingsUseCase,
} from "@/backend/application/use-cases/bookings";
import { asWritableRepositories } from "@/backend/application/ports/writable";
import { PermissionAction, PermissionResource, RoleName } from "@/backend/domain/enums";
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
  bookingCreateSchema,
  bookingQuerySchema,
} from "@/backend/shared/validation/schemas";
import type { Booking } from "@/modules/marketplace/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.BOOKING,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/bookings");
    return jsonError(auth.error, requestId);
  }

  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/bookings");
    return limited;
  }

  const parsed = parseWithSchema(
    bookingQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/bookings");
    return jsonError(parsed.error, requestId);
  }

  const privileged =
    auth.value.roles.includes(RoleName.ADMIN) ||
    auth.value.roles.includes(RoleName.SUPPORT);
  if (
    !privileged &&
    parsed.value.hostId &&
    parsed.value.hostId !== auth.value.userId
  ) {
    finish(403, "/api/v1/bookings");
    return jsonError(
      {
        code: "FORBIDDEN",
        message: "Cannot list another host's bookings.",
        status: 403,
      },
      requestId,
    );
  }
  const scopedQuery = {
    ...parsed.value,
    hostId: privileged
      ? parsed.value.hostId
      : (parsed.value.hostId ?? auth.value.userId),
  };

  const result = await listBookingsUseCase(
    container.repositories.bookings,
    scopedQuery,
  );
  if (!result.ok) {
    finish(result.error.status, "/api/v1/bookings");
    return jsonError(result.error, requestId);
  }
  finish(200, "/api/v1/bookings");
  return fromResult(
    { ok: true, value: result.value.items },
    { meta: result.value.meta, requestId },
  );
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.BOOKING,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/bookings");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/bookings");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(bookingCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/bookings");
    return jsonError(parsed.error, requestId);
  }

  let eventId = parsed.value.eventId;
  if (!eventId) {
    if (container.mode === "prisma") {
      finish(400, "/api/v1/bookings");
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "eventId is required when persistence mode is prisma.",
          status: 400,
        },
        requestId,
      );
    }
    eventId = `event_inline_${crypto.randomUUID()}`;
  }

  const now = new Date().toISOString();
  const booking: Booking = {
    id: `booking_${crypto.randomUUID()}`,
    eventId,
    performerId: parsed.value.performerId,
    hostId: auth.value.userId,
    packageId: parsed.value.packageId,
    agreedPrice: parsed.value.budget,
    status: "requested",
    requestedAt: now,
    updatedAt: now,
  };

  const repos = asWritableRepositories(container.repositories);
  const created = await repos.bookings.create(booking);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "create",
    resource: PermissionResource.BOOKING,
    resourceId: created.id,
    metadata: { input: parsed.value },
    ...clientMeta(request),
  });
  await container.eventBus.publish(
    "BookingCreated",
    {
      bookingId: created.id,
      eventId: created.eventId,
      performerId: created.performerId,
      hostId: created.hostId,
      status: created.status,
    },
    requestId,
  );
  await container.swrCache.publishInvalidation(["bookings"]);
  finish(201, "/api/v1/bookings");
  return jsonOk(created, { status: 201, requestId });
}
