import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/mfa/status");
    return jsonError(auth.error, requestId);
  }
  const status = await container.mfa.getStatus(auth.value.userId);
  finish(200, "/api/v1/auth/mfa/status");
  return jsonOk(status, { requestId });
}
