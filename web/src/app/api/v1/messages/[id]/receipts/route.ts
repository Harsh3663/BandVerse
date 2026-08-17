import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toMessagingError } from "@/backend/presentation/http/messaging-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: entityIdSchema });
const bodySchema = z.object({
  status: z.enum(["delivered", "read"]),
});
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/messages/:id/receipts");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/messages/:id/receipts");
    return jsonError(parsed.error, requestId);
  }

  try {
    const receipts = await container.messaging.listReceipts(parsed.value.id);
    finish(200, "/api/v1/messages/:id/receipts");
    return jsonOk(receipts, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/messages/:id/receipts");
    return jsonError(appError, requestId);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/messages/:id/receipts");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/messages/:id/receipts");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/messages/:id/receipts");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(bodySchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/messages/:id/receipts");
    return jsonError(parsed.error, requestId);
  }

  try {
    const receipt =
      parsed.value.status === "read"
        ? await container.messaging.markRead({
            messageId: parsedParams.value.id,
            participantId: auth.value.userId,
          })
        : await container.messaging.markDelivered({
            messageId: parsedParams.value.id,
            participantId: auth.value.userId,
          });
    finish(200, "/api/v1/messages/:id/receipts");
    return jsonOk(receipt, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/messages/:id/receipts");
    return jsonError(appError, requestId);
  }
}
