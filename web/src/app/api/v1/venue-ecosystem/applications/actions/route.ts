import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toVenueEcosystemError } from "@/backend/presentation/http/venue-ecosystem-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * Thin facade over booking lifecycle for venue/event ecosystem actions.
 * Does not modify the lifecycle module.
 */
const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("apply"),
    eventId: entityIdSchema,
    performerId: entityIdSchema,
    hostId: entityIdSchema,
    message: z.string().trim().min(1).max(2000),
    quotedPaise: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("withdraw"),
    lifecycleId: entityIdSchema,
  }),
  z.object({
    action: z.literal("shortlist"),
    lifecycleId: entityIdSchema,
  }),
  z.object({
    action: z.literal("invite"),
    eventId: entityIdSchema,
    hostId: entityIdSchema,
    performerId: entityIdSchema,
  }),
  z.object({
    action: z.literal("reject"),
    lifecycleId: entityIdSchema,
  }),
]);

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.APPLICATION,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/venue-ecosystem/applications/actions");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/venue-ecosystem/applications/actions");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(actionSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/venue-ecosystem/applications/actions");
    return jsonError(parsed.error, requestId);
  }

  try {
    const { action } = parsed.value;
    let result: unknown;
    if (action === "apply") {
      result = await container.venueEcosystem.applyToEvent({
        ...parsed.value,
        actorUserId: auth.value.userId,
      });
    } else if (action === "withdraw") {
      result = await container.venueEcosystem.withdrawApplication({
        lifecycleId: parsed.value.lifecycleId,
        actorUserId: auth.value.userId,
      });
    } else if (action === "shortlist") {
      result = await container.venueEcosystem.shortlistApplication({
        lifecycleId: parsed.value.lifecycleId,
        actorUserId: auth.value.userId,
      });
    } else if (action === "invite") {
      result = await container.venueEcosystem.invitePerformer({
        ...parsed.value,
        actorUserId: auth.value.userId,
      });
    } else {
      result = await container.venueEcosystem.rejectInvite({
        lifecycleId: parsed.value.lifecycleId,
        actorUserId: auth.value.userId,
      });
    }
    finish(200, "/api/v1/venue-ecosystem/applications/actions");
    return jsonOk(result, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/applications/actions");
    return jsonError(appError, requestId);
  }
}
