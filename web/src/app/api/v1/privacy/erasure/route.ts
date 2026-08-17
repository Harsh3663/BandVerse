import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

/** GDPR-ready erasure request for the authenticated user. */
export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/privacy/erasure");
    return jsonError(auth.error, requestId);
  }

  const result = await container.retention.requestGdprErasure(auth.value.userId);
  finish(200, "/api/v1/privacy/erasure");
  return jsonOk(result, { requestId });
}
