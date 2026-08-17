import { createRequestId, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

/** Process liveness — process is up and serving HTTP. */
export async function GET() {
  return jsonOk(
    { status: "live" as const, timestamp: new Date().toISOString() },
    { requestId: createRequestId() },
  );
}
