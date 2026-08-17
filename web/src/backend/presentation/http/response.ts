import { NextResponse } from "next/server";

import type { ApiErrorResponse, ApiSuccessResponse } from "@/backend/application/dto/responses";
import { getTraceContext } from "@/backend/infrastructure/observability/tracing";
import { toErrorResponse } from "@/backend/shared/errors";
import type { AppError, Result } from "@/backend/shared/result";
import type { PageMeta } from "@/backend/shared/pagination";
import { applyVersionHeaders } from "./api-governance";

function responseHeaders(requestId?: string): Headers {
  const headers = new Headers();
  applyVersionHeaders(headers);
  const trace = getTraceContext();
  const resolvedRequestId = requestId ?? trace?.requestId;
  const correlationId = trace?.correlationId ?? resolvedRequestId;
  if (resolvedRequestId) headers.set("x-request-id", resolvedRequestId);
  if (correlationId) {
    headers.set("x-correlation-id", correlationId);
    headers.set("x-trace-id", correlationId);
  }
  return headers;
}

export function jsonOk<T>(
  data: T,
  init?: { status?: number; meta?: PageMeta; requestId?: string },
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      data,
      meta: init?.meta,
      requestId: init?.requestId,
    },
    { status: init?.status ?? 200, headers: responseHeaders(init?.requestId) },
  );
}

export function jsonError(
  error: AppError,
  requestId?: string,
): NextResponse<ApiErrorResponse & { requestId?: string }> {
  return NextResponse.json(
    { ...toErrorResponse(error), requestId },
    { status: error.status, headers: responseHeaders(requestId) },
  );
}

export function fromResult<T>(
  result: Result<T>,
  init?: { status?: number; meta?: PageMeta; requestId?: string },
): NextResponse<ApiSuccessResponse<T> | (ApiErrorResponse & { requestId?: string })> {
  if (!result.ok) return jsonError(result.error, init?.requestId);
  return jsonOk(result.value, init);
}

export function createRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
