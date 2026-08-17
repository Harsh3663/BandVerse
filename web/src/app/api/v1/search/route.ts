import {
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { paginationQuerySchema } from "@/backend/shared/pagination";
import { stringListSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const searchQuerySchema = paginationQuerySchema.extend({
  type: z.enum(["performers", "bands", "venues", "events"]).default("performers"),
  city: z.string().trim().min(1).max(120).optional(),
  keyword: z.string().trim().min(1).max(200).optional(),
  categoryIds: stringListSchema.optional(),
  sort: z.enum(["relevance", "rating", "name", "date"]).optional(),
});

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/search");
    return limited;
  }

  const parsed = parseWithSchema(
    searchQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/search");
    return jsonError(parsed.error, requestId);
  }

  const query = {
    ...parsed.value,
    keyword: parsed.value.keyword ?? parsed.value.q,
  };

  const result =
    parsed.value.type === "venues"
      ? await container.search.searchVenues(query)
      : parsed.value.type === "events"
        ? await container.search.searchEvents(query)
        : parsed.value.type === "bands"
          ? await container.search.searchBands(query)
          : await container.search.searchPerformers(query);

  finish(200, "/api/v1/search");
  return jsonOk(result.items, {
    meta: result.meta,
    requestId,
  });
}
