import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { parseWithSchema, searchParamsToObject } from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toVenueEcosystemError } from "@/backend/presentation/http/venue-ecosystem-errors";
import { nearbyOpportunitiesQuerySchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/opportunities/nearby");
    return limited;
  }

  const parsed = parseWithSchema(
    nearbyOpportunitiesQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/opportunities/nearby");
    return jsonError(parsed.error, requestId);
  }

  try {
    const items = await container.venueEcosystem.nearbyOpportunities(parsed.value);
    finish(200, "/api/v1/opportunities/nearby");
    return jsonOk({ items }, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/opportunities/nearby");
    return jsonError(appError, requestId);
  }
}
