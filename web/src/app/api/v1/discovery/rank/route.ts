import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { discoveryRankSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "write", requestId);
  if (limited) {
    finish(429, "/api/v1/discovery/rank");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/discovery/rank");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(discoveryRankSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/discovery/rank");
    return jsonError(parsed.error, requestId);
  }

  const ranked = await container.portfolio.rankPerformers(parsed.value.performerIds);
  finish(200, "/api/v1/discovery/rank");
  return jsonOk({ results: ranked }, { requestId });
}
