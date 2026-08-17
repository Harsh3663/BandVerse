import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toPortfolioError } from "@/backend/presentation/http/portfolio-errors";
import { parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ performerId: entityIdSchema });
type RouteContext = { params: Promise<{ performerId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.AVAILABILITY,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(
      auth.error.status,
      "/api/v1/portfolio/:performerId/availability/sync-lifecycle",
    );
    return jsonError(auth.error, requestId);
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/portfolio/:performerId/availability/sync-lifecycle");
    return jsonError(parsed.error, requestId);
  }

  try {
    const month = await container.portfolio.syncAvailabilityFromLifecycle(
      parsed.value.performerId,
    );
    finish(200, "/api/v1/portfolio/:performerId/availability/sync-lifecycle");
    return jsonOk(month, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(
      appError.status,
      "/api/v1/portfolio/:performerId/availability/sync-lifecycle",
    );
    return jsonError(appError, requestId);
  }
}
