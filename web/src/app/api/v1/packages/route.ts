import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toEventPlanningError } from "@/backend/presentation/http/event-planning-errors";
import { vendorPackageUpsertSchema } from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/packages");
    return limited;
  }

  try {
    const items = await container.eventPlanning.listPackages();
    finish(200, "/api/v1/packages");
    return jsonOk(items, { requestId });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/packages");
    return jsonError(appError, requestId);
  }
}

export async function PUT(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "write", requestId);
  if (limited) {
    finish(429, "/api/v1/packages");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/packages");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(vendorPackageUpsertSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/packages");
    return jsonError(parsed.error, requestId);
  }

  try {
    const pkg = await container.eventPlanning.upsertPackage(parsed.value);
    finish(200, "/api/v1/packages");
    return jsonOk(pkg, { requestId });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/packages");
    return jsonError(appError, requestId);
  }
}
