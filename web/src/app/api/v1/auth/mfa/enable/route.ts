import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { createAppError } from "@/backend/shared/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().min(6).max(16),
});

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/auth/mfa/enable");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/auth/mfa/enable");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(schema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/auth/mfa/enable");
    return jsonError(parsed.error, requestId);
  }

  try {
    const status = await container.mfa.enable(auth.value.userId, parsed.value.code);
    finish(200, "/api/v1/auth/mfa/enable");
    return jsonOk(status, { requestId });
  } catch (error) {
    finish(401, "/api/v1/auth/mfa/enable");
    return jsonError(
      createAppError(
        "UNAUTHORIZED",
        error instanceof Error ? error.message : "Unable to enable MFA.",
      ),
      requestId,
    );
  }
}
