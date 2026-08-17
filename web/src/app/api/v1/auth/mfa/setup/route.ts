import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { createAppError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/mfa/setup");
    return jsonError(auth.error, requestId);
  }

  const me = await container.auth.getMe(auth.value.userId);
  if (!me) {
    finish(404, "/api/v1/auth/mfa/setup");
    return jsonError(createAppError("NOT_FOUND", "User not found."), requestId);
  }

  try {
    const setup = await container.mfa.beginSetup(auth.value.userId, me.email);
    finish(200, "/api/v1/auth/mfa/setup");
    return jsonOk(setup, { requestId });
  } catch (error) {
    finish(400, "/api/v1/auth/mfa/setup");
    return jsonError(
      createAppError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "MFA setup failed.",
      ),
      requestId,
    );
  }
}
