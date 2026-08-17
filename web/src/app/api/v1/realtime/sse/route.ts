import { requireAuth } from "@/backend/presentation/http/auth-guard";
import { formatSseEvent } from "@/backend/infrastructure/realtime/gateway";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** SSE stream foundation for booking/notification updates (UI wiring deferred). */
export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requireAuth(request);
  if (!auth.ok) {
    finish(401, "/api/v1/realtime/sse");
    return jsonError(auth.error, requestId);
  }

  const channel = `user:${auth.value.userId}` as const;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(
          formatSseEvent({
            type: "connected",
            channel,
            payload: { userId: auth.value.userId },
            emittedAt: new Date().toISOString(),
          }),
        ),
      );

      const unsubscribe = container.realtime.subscribe(channel, (message) => {
        controller.enqueue(encoder.encode(formatSseEvent(message)));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  finish(200, "/api/v1/realtime/sse");
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-request-id": requestId,
    },
  });
}
