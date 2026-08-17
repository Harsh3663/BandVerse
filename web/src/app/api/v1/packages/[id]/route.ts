import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toEventPlanningError } from "@/backend/presentation/http/event-planning-errors";
import { notFoundError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/packages/:id");
    return limited;
  }

  try {
    const { id } = await context.params;
    const pkg = await container.eventPlanning.getPackage(id);
    if (!pkg) {
      const err = notFoundError("Package", id);
      finish(err.status, "/api/v1/packages/:id");
      return jsonError(err, requestId);
    }
    finish(200, "/api/v1/packages/:id");
    return jsonOk(pkg, { requestId });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/packages/:id");
    return jsonError(appError, requestId);
  }
}
