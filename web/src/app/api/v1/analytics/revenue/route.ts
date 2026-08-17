import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.ANALYTICS,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/analytics/revenue");
    return jsonError(auth.error, requestId);
  }

  const bookings = await container.repositories.bookings.list();
  const completed = bookings.filter((booking) =>
    ["completed", "reviewed", "advance-paid"].includes(booking.status),
  );
  const totalRevenue = completed.reduce(
    (sum, booking) => sum + booking.agreedPrice.amount,
    0,
  );
  const byStatus = completed.reduce<Record<string, number>>((acc, booking) => {
    acc[booking.status] = (acc[booking.status] ?? 0) + booking.agreedPrice.amount;
    return acc;
  }, {});

  finish(200, "/api/v1/analytics/revenue");
  return jsonOk(
    {
      currency: "INR" as const,
      totalRevenue,
      bookingCount: completed.length,
      byStatus,
    },
    { requestId },
  );
}
