import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toPortfolioError } from "@/backend/presentation/http/portfolio-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { portfolioAnalyticsEventSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ performerId: entityIdSchema });
type RouteContext = { params: Promise<{ performerId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.ANALYTICS,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/portfolio/:performerId/analytics");
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId/analytics");
    return jsonError(parsed.error, requestId);
  }

  const analytics = await container.portfolio.getAnalytics(parsed.value.performerId);
  finish(200, "/api/v1/portfolio/:performerId/analytics");
  return jsonOk(analytics, { requestId });
}

export async function POST(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/portfolio/:performerId/analytics");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/portfolio/:performerId/analytics");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(portfolioAnalyticsEventSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId/analytics");
    return jsonError(parsed.error, requestId);
  }

  try {
    const analytics = await container.portfolio.trackEvent({
      performerId: parsedParams.value.performerId,
      ...parsed.value,
    });
    finish(200, "/api/v1/portfolio/:performerId/analytics");
    return jsonOk(analytics, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId/analytics");
    return jsonError(appError, requestId);
  }
}
