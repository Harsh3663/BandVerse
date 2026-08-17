import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toEventPlanningError } from "@/backend/presentation/http/event-planning-errors";
import { eventPlanCreateSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "write", requestId);
  if (limited) {
    finish(429, "/api/v1/event-planner/plans");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/event-planner/plans");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(eventPlanCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/event-planner/plans");
    return jsonError(parsed.error, requestId);
  }

  try {
    const plan = await container.eventPlanning.createEventPlan(parsed.value);
    finish(201, "/api/v1/event-planner/plans");
    return jsonOk(plan, { requestId, status: 201 });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/event-planner/plans");
    return jsonError(appError, requestId);
  }
}
