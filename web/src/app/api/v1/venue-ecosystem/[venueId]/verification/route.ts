import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toVenueEcosystemError } from "@/backend/presentation/http/venue-ecosystem-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { venueVerificationPatchSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ venueId: entityIdSchema });
type RouteContext = { params: Promise<{ venueId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonError(parsed.error, requestId);
  }
  try {
    const verification = await container.venueEcosystem.getVerification(
      parsed.value.venueId,
    );
    finish(200, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonOk(verification, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonError(appError, requestId);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.VERIFICATION,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    const venueAuth = await requirePermission(
      request,
      PermissionResource.VENUE,
      PermissionAction.UPDATE,
    );
    if (!venueAuth.ok) {
      finish(venueAuth.error.status, "/api/v1/venue-ecosystem/:venueId/verification");
      return jsonError(venueAuth.error, requestId);
    }
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonError(parsedParams.error, requestId);
  }
  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(venueVerificationPatchSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonError(parsed.error, requestId);
  }

  try {
    const verification = await container.venueEcosystem.updateVerification(
      parsedParams.value.venueId,
      parsed.value,
    );
    finish(200, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonOk(verification, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/:venueId/verification");
    return jsonError(appError, requestId);
  }
}
