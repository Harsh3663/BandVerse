import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toMessagingError } from "@/backend/presentation/http/messaging-errors";
import {
  parseJsonBody,
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { messageCreateSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const listSchema = z.object({
  conversationId: entityIdSchema,
});

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/messages");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(
    listSchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/messages");
    return jsonError(parsed.error, requestId);
  }

  try {
    await container.messaging.assertParticipant(
      parsed.value.conversationId,
      auth.value.userId,
    );
    const items = await container.messaging.listMessages(parsed.value.conversationId);
    finish(200, "/api/v1/messages");
    return jsonOk(items, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/messages");
    return jsonError(appError, requestId);
  }
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/messages");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/messages");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(messageCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/messages");
    return jsonError(parsed.error, requestId);
  }

  try {
    const content = parsed.value.content ?? parsed.value.body ?? "";
    const message = await container.messaging.sendMessage({
      conversationId: parsed.value.conversationId,
      senderId: auth.value.userId,
      messageType: parsed.value.messageType,
      content,
      attachmentUrl: parsed.value.attachmentUrl,
      mimeType: parsed.value.mimeType,
      sizeBytes: parsed.value.sizeBytes,
      originalName: parsed.value.originalName,
    });
    finish(201, "/api/v1/messages");
    return jsonOk(message, { status: 201, requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/messages");
    return jsonError(appError, requestId);
  }
}
