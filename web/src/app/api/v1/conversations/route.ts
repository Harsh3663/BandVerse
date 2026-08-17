import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toMessagingError } from "@/backend/presentation/http/messaging-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { conversationCreateSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/conversations");
    return jsonError(auth.error, requestId);
  }

  const items = await container.messaging.listConversationsForUser(auth.value.userId);
  finish(200, "/api/v1/conversations");
  return jsonOk(items, { requestId });
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/conversations");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/conversations");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(conversationCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/conversations");
    return jsonError(parsed.error, requestId);
  }

  try {
    const conversation = await container.messaging.createConversation({
      ...parsed.value,
      actorUserId: auth.value.userId,
    });
    finish(201, "/api/v1/conversations");
    return jsonOk(conversation, { status: 201, requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/conversations");
    return jsonError(appError, requestId);
  }
}
