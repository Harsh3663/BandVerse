import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

/** Requeue failed webhook deliveries for payment recovery. */
export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.PAYMENT,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/payments/recover-webhooks");
    return jsonError(auth.error, requestId);
  }

  const recovered = await container.payments.reliability.recoverFailedWebhooks();
  finish(200, "/api/v1/payments/recover-webhooks");
  return jsonOk({ recovered }, { requestId });
}
