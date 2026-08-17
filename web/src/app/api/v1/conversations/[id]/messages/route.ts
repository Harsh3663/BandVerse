import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toMessagingError } from "@/backend/presentation/http/messaging-errors";
import { parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: entityIdSchema });
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/conversations/:id/messages");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/conversations/:id/messages");
    return jsonError(parsed.error, requestId);
  }

  try {
    await container.messaging.assertParticipant(parsed.value.id, auth.value.userId);
    const items = await container.messaging.listMessages(parsed.value.id);
    for (const message of items) {
      if (message.senderId !== auth.value.userId) {
        await container.messaging.markDelivered({
          messageId: message.id,
          participantId: auth.value.userId,
        });
      }
    }
    finish(200, "/api/v1/conversations/:id/messages");
    return jsonOk(items, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/conversations/:id/messages");
    return jsonError(appError, requestId);
  }
}
