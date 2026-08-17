import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/sessions");
    return jsonError(auth.error, requestId);
  }

  if (auth.value.sessionId) {
    await container.sessions.touchSession(auth.value.sessionId);
  }

  const sessions = await container.sessions.listSessions(
    auth.value.userId,
    auth.value.sessionId,
  );
  finish(200, "/api/v1/auth/sessions");
  return jsonOk(sessions, { requestId });
}

export async function DELETE(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/sessions");
    return jsonError(auth.error, requestId);
  }

  const revoked = await container.sessions.revokeAllSessions(
    auth.value.userId,
    auth.value.sessionId,
  );
  finish(200, "/api/v1/auth/sessions");
  return jsonOk({ revoked }, { requestId });
}
