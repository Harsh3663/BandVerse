import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toVenueEcosystemError } from "@/backend/presentation/http/venue-ecosystem-errors";
import { parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ venueId: entityIdSchema });
type RouteContext = { params: Promise<{ venueId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.ANALYTICS,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    const venueAuth = await requirePermission(
      request,
      PermissionResource.VENUE,
      PermissionAction.READ,
    );
    if (!venueAuth.ok) {
      finish(venueAuth.error.status, "/api/v1/venue-ecosystem/:venueId/analytics");
      return jsonError(venueAuth.error, requestId);
    }
  }

  const parsed = parseWithSchema(paramsSchema, await context.params);
  if (!parsed.ok) {
    finish(400, "/api/v1/venue-ecosystem/:venueId/analytics");
    return jsonError(parsed.error, requestId);
  }

  try {
    const analytics = await container.venueEcosystem.getAnalytics(parsed.value.venueId);
    finish(200, "/api/v1/venue-ecosystem/:venueId/analytics");
    return jsonOk(analytics, { requestId });
  } catch (error) {
    const appError = toVenueEcosystemError(error);
    finish(appError.status, "/api/v1/venue-ecosystem/:venueId/analytics");
    return jsonError(appError, requestId);
  }
}
