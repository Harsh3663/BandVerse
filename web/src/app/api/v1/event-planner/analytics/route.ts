import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toEventPlanningError } from "@/backend/presentation/http/event-planning-errors";
import { eventPlanningAnalyticsTrackSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const analytics = await container.eventPlanning.getAnalytics();
  finish(200, "/api/v1/event-planner/analytics");
  return jsonOk(analytics, { requestId });
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "write", requestId);
  if (limited) {
    finish(429, "/api/v1/event-planner/analytics");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/event-planner/analytics");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(eventPlanningAnalyticsTrackSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/event-planner/analytics");
    return jsonError(parsed.error, requestId);
  }

  try {
    const analytics = await container.eventPlanning.track(
      parsed.value.event,
      parsed.value.revenue,
    );
    finish(200, "/api/v1/event-planner/analytics");
    return jsonOk(analytics, { requestId });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/event-planner/analytics");
    return jsonError(appError, requestId);
  }
}
