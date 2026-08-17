import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toVenueEcosystemError } from "@/backend/presentation/http/venue-ecosystem-errors";
import {
  parseJsonBody,
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { recurringGigCreateSchema } from "@/backend/shared/validation/schemas";
import { isoDateSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ venueId: entityIdSchema });
const expandSchema = z.object({
  fromDate: isoDateSchema,
  toDate: isoDateSchema,
});
type RouteContext = { params: Promise<{ venueId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonError(parsedParams.error, requestId);
  }

  const url = new URL(request.url);
  if (url.searchParams.get("fromDate") && url.searchParams.get("toDate")) {
    const expand = parseWithSchema(
      expandSchema,
      searchParamsToObject(url.searchParams),
    );
    if (!expand.ok) {
      finish(400, "/api/v1/venue-ecosystem/:venueId/gigs");
      return jsonError(expand.error, requestId);
    }
    try {
      const occurrences = await container.venueEcosystem.expandGigs({
        venueId: parsedParams.value.venueId,
        ...expand.value,
      });
      finish(200, "/api/v1/venue-ecosystem/:venueId/gigs");
      return jsonOk({ occurrences }, { requestId });
    } catch (error) {
      const appError = toVenueEcosystemError(error);
      finish(appError.status, "/api/v1/venue-ecosystem/:venueId/gigs");
      return jsonError(appError, requestId);
    }
  }

  try {
    const gigs = await container.venueEcosystem.listGigs(parsedParams.value.venueId);
    finish(200, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonOk(gigs, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonError(appError, requestId);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.VENUE,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonError(parsedParams.error, requestId);
  }
  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(recurringGigCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonError(parsed.error, requestId);
  }

  try {
    const gig = await container.venueEcosystem.createGig({
      venueId: parsedParams.value.venueId,
      ...parsed.value,
    });
    finish(201, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonOk(gig, { status: 201, requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/:venueId/gigs");
    return jsonError(appError, requestId);
  }
}
