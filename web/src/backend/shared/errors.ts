import type { AppError } from "./result";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INVALID_TRANSITION"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

const statusByCode: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INVALID_TRANSITION: 422,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA: 415,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export function createAppError(
  code: ErrorCode,
  message: string,
  options?: {
    details?: readonly unknown[];
    cause?: unknown;
    status?: number;
  },
): AppError {
  return {
    code,
    message,
    details: options?.details,
    cause: options?.cause,
    status: options?.status ?? statusByCode[code],
  };
}

export function validationError(
  message: string,
  details?: readonly unknown[],
): AppError {
  return createAppError("VALIDATION_ERROR", message, { details });
}

export function notFoundError(resource: string, id?: string): AppError {
  return createAppError(
    "NOT_FOUND",
    id ? `${resource} '${id}' was not found.` : `${resource} was not found.`,
  );
}

export function unauthorizedError(message = "Authentication required."): AppError {
  return createAppError("UNAUTHORIZED", message);
}

export function forbiddenError(message = "Insufficient permissions."): AppError {
  return createAppError("FORBIDDEN", message);
}

export function conflictError(message: string): AppError {
  return createAppError("CONFLICT", message);
}

export function invalidTransitionError(
  entity: string,
  from: string,
  to: string,
): AppError {
  return createAppError(
    "INVALID_TRANSITION",
    `Invalid ${entity} status transition: ${from} -> ${to}.`,
  );
}

export function internalError(
  message = "An unexpected error occurred.",
  cause?: unknown,
): AppError {
  return createAppError("INTERNAL_ERROR", message, { cause });
}

export function toErrorResponse(error: AppError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
}
