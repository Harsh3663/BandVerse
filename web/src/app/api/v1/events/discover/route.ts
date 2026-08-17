import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { parseWithSchema, searchParamsToObject } from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toVenueEcosystemError } from "@/backend/presentation/http/venue-ecosystem-errors";
import { eventDiscoverQuerySchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/events/discover");
    return limited;
  }

  const parsed = parseWithSchema(
    eventDiscoverQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/events/discover");
    return jsonError(parsed.error, requestId);
  }

  try {
    const events = await container.venueEcosystem.discoverEvents(parsed.value);
    finish(200, "/api/v1/events/discover");
    return jsonOk({ items: events, filters: parsed.value }, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/events/discover");
    return jsonError(appError, requestId);
  }
}
