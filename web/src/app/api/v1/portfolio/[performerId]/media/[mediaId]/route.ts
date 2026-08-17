import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toPortfolioError } from "@/backend/presentation/http/portfolio-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { portfolioMediaUpdateSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  performerId: entityIdSchema,
  mediaId: entityIdSchema,
});
type RouteContext = { params: Promise<{ performerId: string; mediaId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.PORTFOLIO,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(portfolioMediaUpdateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(parsed.error, requestId);
  }

  try {
    const existing = await container.portfolio.getMedia(parsedParams.value.mediaId);
    if (!existing || existing.performerId !== parsedParams.value.performerId) {
      finish(404, "/api/v1/portfolio/:performerId/media/:mediaId");
      return jsonError(
        { code: "NOT_FOUND", message: "Media item was not found.", status: 404 },
        requestId,
      );
    }
    const item = await container.portfolio.updateMedia(
      parsedParams.value.mediaId,
      parsed.value,
    );
    finish(200, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonOk(item, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(appError, requestId);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.PORTFOLIO,
    PermissionAction.DELETE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(parsedParams.error, requestId);
  }

  try {
    const existing = await container.portfolio.getMedia(parsedParams.value.mediaId);
    if (!existing || existing.performerId !== parsedParams.value.performerId) {
      finish(404, "/api/v1/portfolio/:performerId/media/:mediaId");
      return jsonError(
        { code: "NOT_FOUND", message: "Media item was not found.", status: 404 },
        requestId,
      );
    }
    await container.portfolio.deleteMedia(parsedParams.value.mediaId);
    finish(200, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonOk({ deleted: true }, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId/media/:mediaId");
    return jsonError(appError, requestId);
  }
}
