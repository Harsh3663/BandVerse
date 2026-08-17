import { getBackendContainer } from "@/backend/infrastructure/container";
import { createRequestId, jsonOk } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

/** Liveness-oriented health probe with service metadata. */
export async function GET() {
  const container = getBackendContainer();
  return jsonOk(
    {
      status: "ok" as const,
      service: "bandverse-api" as const,
      timestamp: new Date().toISOString(),
      mode: container.mode,
    },
    { requestId: createRequestId() },
  );
}
