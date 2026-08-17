import {
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import {
  parseJsonBody,
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { toEventPlanningError } from "@/backend/presentation/http/event-planning-errors";
import {
  vendorCreateSchema,
  vendorQuerySchema,
} from "@/backend/shared/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/vendors");
    return limited;
  }

  const parsed = parseWithSchema(
    vendorQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/vendors");
    return jsonError(parsed.error, requestId);
  }

  try {
    const items = await container.eventPlanning.listVendors(parsed.value);
    finish(200, "/api/v1/vendors");
    return jsonOk(items, { requestId });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/vendors");
    return jsonError(appError, requestId);
  }
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "write", requestId);
  if (limited) {
    finish(429, "/api/v1/vendors");
    return limited;
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/vendors");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(vendorCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/vendors");
    return jsonError(parsed.error, requestId);
  }

  try {
    const vendor = await container.eventPlanning.createVendor(parsed.value);
    finish(201, "/api/v1/vendors");
    return jsonOk(vendor, { requestId, status: 201 });
  } catch (error) {
    const appError = toEventPlanningError(error);
    finish(appError.status, "/api/v1/vendors");
    return jsonError(appError, requestId);
  }
}
