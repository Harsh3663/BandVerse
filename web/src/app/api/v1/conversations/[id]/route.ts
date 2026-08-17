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
    finish(auth.error.status, "/api/v1/conversations/:id");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/conversations/:id");
    return jsonError(parsed.error, requestId);
  }

  try {
    const conversation = await container.messaging.assertParticipant(
      parsed.value.id,
      auth.value.userId,
    );
    const [messages, offers, thread] = await Promise.all([
      container.messaging.listMessages(conversation.id),
      container.messaging.listOffers(conversation.id),
      container.messaging.toChatThread(conversation.id),
    ]);
    finish(200, "/api/v1/conversations/:id");
    return jsonOk({ conversation, messages, offers, thread }, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/conversations/:id");
    return jsonError(appError, requestId);
  }
}
