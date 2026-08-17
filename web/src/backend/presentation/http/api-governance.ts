import { createAppError } from "@/backend/shared/errors";
import { jsonError } from "./response";

export const API_VERSION = "v1";
export const API_DEPRECATION_HEADER = "Deprecation";
export const API_SUNSET_HEADER = "Sunset";

export const payloadLimits = {
  jsonBytes: 1_048_576 as number,
  authJsonBytes: 64_512 as number,
  webhookBytes: 2_097_152 as number,
};

export const throttlePolicies = {
  publicRead: { limit: 120, windowMs: 60_000 },
  auth: { limit: 20, windowMs: 60_000 },
  write: { limit: 60, windowMs: 60_000 },
  webhook: { limit: 300, windowMs: 60_000 },
  search: { limit: 90, windowMs: 60_000 },
} as const;

export function applyVersionHeaders(headers: Headers, options?: { deprecated?: boolean; sunset?: string }) {
  headers.set("X-API-Version", API_VERSION);
  if (options?.deprecated) {
    headers.set(API_DEPRECATION_HEADER, "true");
  }
  if (options?.sunset) {
    headers.set(API_SUNSET_HEADER, options.sunset);
  }
}

export async function enforcePayloadLimit(
  request: Request,
  requestId: string,
  maxBytes: number = payloadLimits.jsonBytes,
) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return jsonError(
      createAppError("PAYLOAD_TOO_LARGE", `Payload exceeds ${maxBytes} bytes.`),
      requestId,
    );
  }
  return null;
}

const abuseScores = new Map<string, { score: number; resetAt: number }>();

export function recordAbuseSignal(key: string, weight = 1): boolean {
  const now = Date.now();
  const current = abuseScores.get(key);
  if (!current || current.resetAt <= now) {
    abuseScores.set(key, { score: weight, resetAt: now + 60_000 });
    return false;
  }
  current.score += weight;
  return current.score >= 20;
}

export function isAbusive(key: string): boolean {
  const current = abuseScores.get(key);
  if (!current) return false;
  if (current.resetAt <= Date.now()) {
    abuseScores.delete(key);
    return false;
  }
  return current.score >= 20;
}
