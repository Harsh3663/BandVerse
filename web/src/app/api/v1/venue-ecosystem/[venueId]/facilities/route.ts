import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toVenueEcosystemError } from "@/backend/presentation/http/venue-ecosystem-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { venueFacilitiesSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ venueId: entityIdSchema });
type RouteContext = { params: Promise<{ venueId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonError(parsed.error, requestId);
  }
  try {
    const facilities = await container.venueEcosystem.getFacilities(
      parsed.value.venueId,
    );
    finish(200, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonOk(facilities, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonError(appError, requestId);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.VENUE,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonError(parsedParams.error, requestId);
  }
  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(venueFacilitiesSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonError(parsed.error, requestId);
  }

  try {
    const facilities = await container.venueEcosystem.upsertFacilities(
      parsedParams.value.venueId,
      parsed.value,
    );
    finish(200, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonOk(facilities, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/:venueId/facilities");
    return jsonError(appError, requestId);
  }
}
