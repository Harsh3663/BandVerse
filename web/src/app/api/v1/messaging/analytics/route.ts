import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.ANALYTICS,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    // Fallback: messaging participants can read own messaging analytics
    const msgAuth = await requirePermission(
      request,
      PermissionResource.MESSAGE,
      PermissionAction.READ,
    );
    if (!msgAuth.ok) {
      finish(msgAuth.error.status, "/api/v1/messaging/analytics");
      return jsonError(msgAuth.error, requestId);
    }
    const analytics = await container.messaging.getAnalytics(msgAuth.value.userId);
    finish(200, "/api/v1/messaging/analytics");
    return jsonOk(analytics, { requestId });
  }

  const analytics = await container.messaging.getAnalytics(auth.value.userId);
  finish(200, "/api/v1/messaging/analytics");
  return jsonOk(analytics, { requestId });
}
