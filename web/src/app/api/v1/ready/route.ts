import { getBackendContainer } from "@/backend/infrastructure/container";
import { verifyRuntimeDependencies } from "@/backend/infrastructure/bootstrap/env";
import { checkDatabaseConnectivity } from "@/backend/infrastructure/persistence/prisma/client";
import { createRequestId, jsonError, jsonOk } from "@/backend/presentation/http/response";
import { createAppError } from "@/backend/shared/errors";

export const dynamic = "force-dynamic";

/** Readiness — dependencies required to serve traffic. */
export async function GET() {
  const requestId = createRequestId();
  const container = getBackendContainer();

  if (process.env.NODE_ENV === "production" && container.mode === "mock") {
    return jsonError(
      createAppError("SERVICE_UNAVAILABLE", "Mock persistence is not ready for production."),
      requestId,
    );
  }

  if (container.mode === "mock") {
    return jsonOk(
      {
        status: "ready" as const,
        persistence: "mock" as const,
        database: false,
        redis: Boolean(process.env.REDIS_URL),
      },
      { requestId },
    );
  }

  const deps = await verifyRuntimeDependencies({
    checkDatabase: checkDatabaseConnectivity,
    redisUrl: process.env.REDIS_URL,
  });

  if (!deps.database) {
    return jsonError(
      createAppError("SERVICE_UNAVAILABLE", "Database is not reachable."),
      requestId,
    );
  }

  if (process.env.REDIS_URL?.trim() && !deps.redis) {
    return jsonError(
      createAppError("SERVICE_UNAVAILABLE", "Redis is configured but not reachable."),
      requestId,
    );
  }

  return jsonOk(
    {
      status: "ready" as const,
      persistence: "prisma" as const,
      database: true,
      redis: deps.redis,
    },
    { requestId },
  );
}
