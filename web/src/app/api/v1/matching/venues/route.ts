import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { parseWithSchema, searchParamsToObject } from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toMatchingError } from "@/backend/presentation/http/matching-errors";
import { matchingContextQuerySchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/matching/venues");
    return limited;
  }

  const parsed = parseWithSchema(
    matchingContextQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/matching/venues");
    return jsonError(parsed.error, requestId);
  }

  try {
    const items = await container.matching.matchVenues(parsed.value);
    finish(200, "/api/v1/matching/venues");
    return jsonOk({ items }, { requestId });
  } catch (error) {
    const appError = toMatchingError(error);
    finish(appError.status, "/api/v1/matching/venues");
    return jsonError(appError, requestId);
  }
}
