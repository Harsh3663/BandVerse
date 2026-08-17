import { PermissionAction, PermissionResource, RoleName } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import {
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { paginate } from "@/backend/shared/pagination";
import { paymentQuerySchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.PAYMENT,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/payments");
    return jsonError(auth.error, requestId);
  }

  const url = new URL(request.url);
  const parsed = parseWithSchema(
    paymentQuerySchema,
    searchParamsToObject(url.searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/payments");
    return jsonError(parsed.error, requestId);
  }

  const isPrivileged =
    auth.value.roles.includes(RoleName.ADMIN) ||
    auth.value.roles.includes(RoleName.SUPPORT);

  const bookings = await container.repositories.bookings.list();
  const allowedBookingIds = new Set(
    bookings
      .filter((booking) => isPrivileged || booking.hostId === auth.value.userId)
      .map((booking) => booking.id),
  );

  // Performers: also allow payments for bookings where they are the performer.
  if (!isPrivileged) {
    const performers = await container.repositories.performers.list();
    const mine = performers.filter(
      (performer) =>
        "userId" in performer
          ? (performer as { userId?: string }).userId === auth.value.userId
          : performer.id === auth.value.userId,
    );
    const performerIds = new Set(mine.map((p) => p.id));
    for (const booking of bookings) {
      if (performerIds.has(booking.performerId)) {
        allowedBookingIds.add(booking.id);
      }
    }
  }

  const payments = await container.repositories.payments.list();
  const filtered = payments.filter((payment) => {
    if (!allowedBookingIds.has(payment.bookingId)) return false;
    if (parsed.value.bookingId && payment.bookingId !== parsed.value.bookingId) {
      return false;
    }
    if (parsed.value.status && payment.status !== parsed.value.status) return false;
    return true;
  });
  const page = paginate(filtered, parsed.value);
  finish(200, "/api/v1/payments");
  return jsonOk(page.items, { meta: page.meta, requestId });
}
