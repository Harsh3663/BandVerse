import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toPortfolioError } from "@/backend/presentation/http/portfolio-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { verifiedPerformanceReviewSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  performerId: entityIdSchema,
  id: entityIdSchema,
});
type RouteContext = { params: Promise<{ performerId: string; id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.VERIFICATION,
    PermissionAction.APPROVE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/portfolio/:performerId/verified/:id");
    return jsonError(auth.error, requestId);
  }

  const parsedParams = parseWithSchema(paramsSchema, await context.params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/portfolio/:performerId/verified/:id");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/portfolio/:performerId/verified/:id");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(verifiedPerformanceReviewSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId/verified/:id");
    return jsonError(parsed.error, requestId);
  }

  try {
    const item = await container.portfolio.reviewVerification({
      id: parsedParams.value.id,
      status: parsed.value.status,
    });
    finish(200, "/api/v1/portfolio/:performerId/verified/:id");
    return jsonOk(
      {
        ...item,
        badge:
          item.verificationStatus === "verified"
            ? "Verified Event Performance"
            : undefined,
      },
      { requestId },
    );
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/portfolio/:performerId/verified/:id");
    return jsonError(appError, requestId);
  }
}
