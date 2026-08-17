import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toPortfolioError } from "@/backend/presentation/http/portfolio-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { portfolioUpdateSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ performerId: entityIdSchema });

type RouteContext = { params: Promise<{ performerId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId");
    return jsonError(parsed.error, requestId);
  }

  try {
    const showcase = await container.portfolio.getShowcase(parsed.value.performerId);
    await container.portfolio.trackEvent({
      performerId: parsed.value.performerId,
      event: "portfolio_view",
    });
    finish(200, "/api/v1/portfolio/:performerId");
    return jsonOk(showcase, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId");
    return jsonError(appError, requestId);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.PORTFOLIO,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/portfolio/:performerId");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/portfolio/:performerId");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/portfolio/:performerId");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(portfolioUpdateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId");
    return jsonError(parsed.error, requestId);
  }

  try {
    const media = await container.portfolio.listMedia(parsedParams.value.performerId);
    for (const item of media) {
      const shouldFeature = parsed.value.mediaIds.includes(item.id);
      if (Boolean(item.featured) !== shouldFeature) {
        await container.portfolio.updateMedia(item.id, { featured: shouldFeature });
      }
    }
    const showcase = await container.portfolio.getShowcase(
      parsedParams.value.performerId,
    );
    finish(200, "/api/v1/portfolio/:performerId");
    return jsonOk(
      { headline: parsed.value.headline, showcase },
      { requestId },
    );
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId");
    return jsonError(appError, requestId);
  }
}
