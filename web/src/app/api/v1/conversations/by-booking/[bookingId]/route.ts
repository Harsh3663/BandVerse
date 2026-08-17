import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toMessagingError } from "@/backend/presentation/http/messaging-errors";
import { parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ bookingId: entityIdSchema });
type RouteContext = { params: Promise<{ bookingId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/conversations/by-booking/:bookingId");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/conversations/by-booking/:bookingId");
    return jsonError(parsed.error, requestId);
  }

  try {
    let conversation = await container.messaging.getByBooking(parsed.value.bookingId);
    if (!conversation) {
      const booking = await container.repositories.bookings.getById(
        parsed.value.bookingId,
      );
      if (!booking) {
        finish(404, "/api/v1/conversations/by-booking/:bookingId");
        return jsonError(
          { code: "NOT_FOUND", message: "Booking not found.", status: 404 },
          requestId,
        );
      }
      if (
        auth.value.userId !== booking.hostId &&
        auth.value.userId !== booking.performerId
      ) {
        finish(403, "/api/v1/conversations/by-booking/:bookingId");
        return jsonError(
          {
            code: "FORBIDDEN",
            message: "Not a booking participant.",
            status: 403,
          },
          requestId,
        );
      }
      conversation = await container.messaging.createConversation({
        organizerId: booking.hostId,
        performerId: booking.performerId,
        bookingId: booking.id,
        eventId: booking.eventId,
        actorUserId: auth.value.userId,
      });
    } else {
      await container.messaging.assertParticipant(
        conversation.id,
        auth.value.userId,
      );
    }

    const [messages, offers, thread] = await Promise.all([
      container.messaging.listMessages(conversation.id),
      container.messaging.listOffers(conversation.id),
      container.messaging.toChatThread(conversation.id),
    ]);
    finish(200, "/api/v1/conversations/by-booking/:bookingId");
    return jsonOk({ conversation, messages, offers, thread }, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/conversations/by-booking/:bookingId");
    return jsonError(appError, requestId);
  }
}
