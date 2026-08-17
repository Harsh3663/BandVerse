import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toMessagingError } from "@/backend/presentation/http/messaging-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { negotiationCounterSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: entityIdSchema,
  offerId: entityIdSchema,
});
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("accept") }),
  z.object({ action: z.literal("reject") }),
  negotiationCounterSchema.extend({ action: z.literal("counter") }),
]);

type RouteContext = {
  params: Promise<{ id: string; offerId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.MESSAGE,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/conversations/:id/offers/:offerId/actions");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/conversations/:id/offers/:offerId/actions");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/conversations/:id/offers/:offerId/actions");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(actionSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/conversations/:id/offers/:offerId/actions");
    return jsonError(parsed.error, requestId);
  }

  try {
    await container.messaging.assertParticipant(
      parsedParams.value.id,
      auth.value.userId,
    );

    if (parsed.value.action === "accept") {
      const offer = await container.messaging.acceptOffer({
        offerId: parsedParams.value.offerId,
        actorUserId: auth.value.userId,
      });
      finish(200, "/api/v1/conversations/:id/offers/:offerId/actions");
      return jsonOk(offer, { requestId });
    }
    if (parsed.value.action === "reject") {
      const offer = await container.messaging.rejectOffer({
        offerId: parsedParams.value.offerId,
        actorUserId: auth.value.userId,
      });
      finish(200, "/api/v1/conversations/:id/offers/:offerId/actions");
      return jsonOk(offer, { requestId });
    }

    const result = await container.messaging.counterOffer({
      offerId: parsedParams.value.offerId,
      senderId: auth.value.userId,
      amount: parsed.value.amount,
      currency: parsed.value.currency,
      notes: parsed.value.notes,
    });
    finish(200, "/api/v1/conversations/:id/offers/:offerId/actions");
    return jsonOk(result, { requestId });
  } catch (error) {
    const appError = toMessagingError(error);
    finish(appError.status, "/api/v1/conversations/:id/offers/:offerId/actions");
    return jsonError(appError, requestId);
  }
}
