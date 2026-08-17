import { createHash } from "node:crypto";

import { recommendPerformersUseCase } from "@/backend/application/use-cases/recommendations";
import { defaultCacheTtl } from "@/backend/infrastructure/cache";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { fromResult, jsonError } from "@/backend/presentation/http/response";
import { recommendationRequestSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "write", requestId);
  if (limited) {
    finish(429, "/api/v1/recommendations");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/recommendations");
    return jsonError(body.error, requestId);
  }

  const parsed = parseWithSchema(recommendationRequestSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/recommendations");
    return jsonError(parsed.error, requestId);
  }

  const inputHash = createHash("sha256")
    .update(JSON.stringify(parsed.value))
    .digest("hex")
    .slice(0, 16);

  const result = await container.cache.remember(
    ["recommendations", inputHash],
    () => recommendPerformersUseCase(parsed.value, container.portfolio),
    { ttlSeconds: defaultCacheTtl.recommendations, tags: ["recommendations"] },
  );

  await container.queue.enqueue("recommendation.generate", {
    requestId,
    inputHash,
  });

  finish(result.ok ? 200 : result.error.status, "/api/v1/recommendations");
  return fromResult(result, { requestId });
}
