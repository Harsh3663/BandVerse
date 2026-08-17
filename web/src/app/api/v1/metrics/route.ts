import { renderPrometheusMetrics } from "@/backend/infrastructure/observability/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(renderPrometheusMetrics(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    },
  });
}
