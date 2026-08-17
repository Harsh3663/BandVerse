import { getBackendContainer } from "@/backend/infrastructure/container";
import { defaultRateLimits } from "@/backend/infrastructure/security/rate-limit";
import {
  incrementMetric,
  observeLatencyMs,
} from "@/backend/infrastructure/observability/metrics";
import { logger } from "@/backend/infrastructure/observability/logger";
import { enterTrace } from "@/backend/infrastructure/observability/tracing";
import { detectSuspiciousActivity } from "@/backend/infrastructure/security/brute-force";
import { createAppError } from "@/backend/shared/errors";
import {
  enforcePayloadLimit,
  isAbusive,
  recordAbuseSignal,
  throttlePolicies,
} from "./api-governance";
import { createRequestId, jsonError } from "./response";

export async function withRequestContext(request: Request) {
  const requestId =
    request.headers.get("x-request-id") ?? createRequestId();
  const correlationId =
    request.headers.get("x-correlation-id") ??
    request.headers.get("x-trace-id") ??
    requestId;
  enterTrace({ requestId, correlationId });
  const started = Date.now();
  incrementMetric("http_requests_total");
  return {
    requestId,
    correlationId,
    container: getBackendContainer(),
    finish(status: number, route: string) {
      const durationMs = Date.now() - started;
      observeLatencyMs("http_request", durationMs);
      logger.info("request.completed", {
        requestId,
        correlationId,
        route,
        method: request.method,
        status,
        durationMs,
      });
      if (status >= 400) {
        incrementMetric("http_errors_total");
        const abuseKey = request.headers.get("x-forwarded-for") ?? "local";
        if (recordAbuseSignal(abuseKey, status === 401 || status === 403 ? 2 : 1)) {
          incrementMetric("abuse_blocked_total");
        }
      }
      detectSuspiciousActivity({
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
        path: route,
        status,
      });
    },
  };
}

export async function enforceRateLimit(
  request: Request,
  bucket: keyof typeof defaultRateLimits | keyof typeof throttlePolicies,
  requestId: string,
) {
  const abuseKey = request.headers.get("x-forwarded-for") ?? "local";
  if (isAbusive(abuseKey)) {
    return jsonError(
      createAppError("RATE_LIMITED", "Suspicious activity detected. Try again later."),
      requestId,
    );
  }

  const container = getBackendContainer();
  const key = `${bucket}:${abuseKey}`;
  const config =
    bucket in defaultRateLimits
      ? defaultRateLimits[bucket as keyof typeof defaultRateLimits]
      : throttlePolicies[bucket as keyof typeof throttlePolicies];
  const rate = await container.rateLimit.consume(key, config.limit, config.windowMs);
  if (!rate.allowed) {
    return jsonError(
      createAppError("RATE_LIMITED", "Too many requests. Try again shortly."),
      requestId,
    );
  }
  return null;
}

export async function enforceRequestPayload(
  request: Request,
  requestId: string,
  maxBytes?: number,
) {
  return enforcePayloadLimit(request, requestId, maxBytes);
}

export function clientMeta(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  };
}
