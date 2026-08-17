import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toMessagingError } from "@/backend/presentation/http/messaging-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { negotiationOfferCreateSchema } from "@/backend/shared/validation/schemas";
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
    finish(auth.error.status, "/api/v1/conversations/:id/offers");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/conversations/:id/offers");
    return jsonError(parsed.error, requestId);
  }

  try {
    await container.messaging.assertParticipant(parsed.value.id, auth.value.userId);
    const items = await container.messaging.listOffers(parsed.value.id);
    finish(200, "/api/v1/conversations/:id/offers");
    return jsonOk(items, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/conversations/:id/offers");
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
    finish(auth.error.status, "/api/v1/conversations/:id/offers");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/conversations/:id/offers");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/conversations/:id/offers");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(negotiationOfferCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/conversations/:id/offers");
    return jsonError(parsed.error, requestId);
  }

  try {
    const offer = await container.messaging.createOffer({
      conversationId: parsedParams.value.id,
      senderId: auth.value.userId,
      ...parsed.value,
    });
    finish(201, "/api/v1/conversations/:id/offers");
    return jsonOk(offer, { status: 201, requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/conversations/:id/offers");
    return jsonError(appError, requestId);
  }
}
