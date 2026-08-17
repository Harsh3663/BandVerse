import { getPerformerAnalyticsUseCase } from "@/backend/application/use-cases/analytics";
import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { assertOwnership } from "@/backend/presentation/http/ownership-guard";
import { parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import {
  fromResult,
  jsonError,
} from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  performerId: entityIdSchema,
});

type RouteContext = { params: Promise<{ performerId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.ANALYTICS,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/analytics/performer/:performerId");
    return jsonError(auth.error, requestId);
  }

  const params = await context.params;
  const parsed = parseWithSchema(paramsSchema, params);
  if (!parsed.ok) {
    finish(400, "/api/v1/analytics/performer/:performerId");
    return jsonError(parsed.error, requestId);
  }

  const performer = await container.repositories.performers.getById(
    parsed.value.performerId,
  );
  if (!performer) {
    finish(404, "/api/v1/analytics/performer/:performerId");
    return jsonError(
      { code: "NOT_FOUND", message: "Performer not found.", status: 404 },
      requestId,
    );
  }

  const ownerUserId =
    "userId" in performer && typeof (performer as { userId?: string }).userId === "string"
      ? (performer as { userId: string }).userId
      : performer.id;

  const owned = assertOwnership(auth.value, [ownerUserId], "Not your performer analytics.");
  if (!owned.ok) {
    finish(403, "/api/v1/analytics/performer/:performerId");
    return jsonError(owned.error, requestId);
  }

  const result = await getPerformerAnalyticsUseCase(
    container.repositories.performers,
    container.repositories.applications,
    container.repositories.bookings,
    parsed.value.performerId,
  );
  finish(result.ok ? 200 : result.error.status, "/api/v1/analytics/performer/:performerId");
  return fromResult(result, { requestId });
}
