import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toPortfolioError } from "@/backend/presentation/http/portfolio-errors";
import {
  parseJsonBody,
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { portfolioAvailabilityDaySchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ performerId: entityIdSchema });
const querySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});
type RouteContext = { params: Promise<{ performerId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/portfolio/:performerId/availability");
    return jsonError(parsedParams.error, requestId);
  }

  const now = new Date();
  const query = parseWithSchema(querySchema, {
    year: new URL(request.url).searchParams.get("year") ?? String(now.getUTCFullYear()),
    month:
      new URL(request.url).searchParams.get("month") ??
      String(now.getUTCMonth() + 1),
    ...searchParamsToObject(new URL(request.url).searchParams),
  });
  if (!query.ok) {
    finish(400, "/api/v1/portfolio/:performerId/availability");
    return jsonError(query.error, requestId);
  }

  try {
    const month = await container.portfolio.getMonth({
      performerId: parsedParams.value.performerId,
      year: query.value.year,
      month: query.value.month,
    });
    finish(200, "/api/v1/portfolio/:performerId/availability");
    return jsonOk(month, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId/availability");
    return jsonError(appError, requestId);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.AVAILABILITY,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/portfolio/:performerId/availability");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/portfolio/:performerId/availability");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/portfolio/:performerId/availability");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(portfolioAvailabilityDaySchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId/availability");
    return jsonError(parsed.error, requestId);
  }

  try {
    const day = await container.portfolio.upsertAvailabilityDay({
      performerId: parsedParams.value.performerId,
      ...parsed.value,
    });
    finish(200, "/api/v1/portfolio/:performerId/availability");
    return jsonOk(day, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId/availability");
    return jsonError(appError, requestId);
  }
}
