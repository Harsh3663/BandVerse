import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { createAppError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-razorpay-signature") ??
    request.headers.get("stripe-signature") ??
    "";

  if (!signature) {
    finish(401, "/api/v1/payments/webhook");
    return jsonError(createAppError("UNAUTHORIZED", "Missing webhook signature."), requestId);
  }

  try {
    const event = await container.payments.handleWebhook({
      rawBody,
      signature,
      timestamp: request.headers.get("stripe-signature-timestamp") ?? undefined,
    });
    finish(200, "/api/v1/payments/webhook");
    return jsonOk({ received: true, event }, { requestId });
  } catch (error) {
    finish(401, "/api/v1/payments/webhook");
    return jsonError(
      createAppError(
        "UNAUTHORIZED",
        error instanceof Error ? error.message : "Webhook verification failed.",
      ),
      requestId,
    );
  }
}
