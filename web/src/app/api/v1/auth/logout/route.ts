import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { clearRefreshCookie } from "@/backend/infrastructure/security/cookies";
import { requireAuth } from "@/backend/presentation/http/auth-guard";
import {
  clientMeta,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/logout");
    return jsonError(auth.error, requestId);
  }

  if (auth.value.sessionId) {
    await container.auth.logout(auth.value.sessionId);
  }
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "logout",
    resource: "session",
    resourceId: auth.value.sessionId,
    ...clientMeta(request),
  });

  const response = jsonOk({ success: true }, { requestId });
  clearRefreshCookie(response);
  finish(200, "/api/v1/auth/logout");
  return response;
}
