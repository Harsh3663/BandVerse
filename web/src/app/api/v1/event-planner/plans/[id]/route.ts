import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toEventPlanningError } from "@/backend/presentation/http/event-planning-errors";
import { eventPlanCustomizeSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "write", requestId);
  if (limited) {
    finish(429, "/api/v1/event-planner/plans/:id");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/event-planner/plans/:id");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(eventPlanCustomizeSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/event-planner/plans/:id");
    return jsonError(parsed.error, requestId);
  }

  try {
    const { id } = await context.params;
    const plan = await container.eventPlanning.customizePlan({
      planId: id,
      ...parsed.value,
    });
    finish(200, "/api/v1/event-planner/plans/:id");
    return jsonOk(plan, { requestId });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/event-planner/plans/:id");
    return jsonError(appError, requestId);
  }
}
