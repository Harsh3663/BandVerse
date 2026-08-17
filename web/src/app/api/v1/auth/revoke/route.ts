import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { requireAuth } from "@/backend/presentation/http/auth-guard";
import {
  clientMeta,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

/** Revoke all refresh sessions for the authenticated user. */
export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/revoke");
    return jsonError(auth.error, requestId);
  }

  const revoked = await container.auth.revokeAllSessions(auth.value.userId);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "logout",
    resource: "session",
    metadata: { revoked },
    ...clientMeta(request),
  });

  finish(200, "/api/v1/auth/revoke");
  return jsonOk({ revoked }, { requestId });
}
