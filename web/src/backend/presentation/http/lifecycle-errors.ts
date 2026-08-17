import { createAppError } from "@/backend/shared/errors";
import type { AppError } from "@/backend/shared/result";

export function toLifecycleError(error: unknown): AppError {
  if (error && typeof error === "object" && "code" in error && "status" in error) {
    const coded = error as { code: string; status: number; message?: string };
    if (coded.code === "INVALID_TRANSITION" || coded.status === 409) {
      return createAppError(
        "CONFLICT",
        coded.message ?? "Invalid lifecycle transition.",
      );
    }
    if (coded.status === 404) {
      return createAppError("NOT_FOUND", coded.message ?? "Not found.");
    }
    if (coded.status === 400) {
      return createAppError(
        "VALIDATION_ERROR",
        coded.message ?? "Validation failed.",
      );
    }
  }
  if (error && typeof error === "object" && "code" in error) {
    return error as AppError;
  }
  return createAppError(
    "INTERNAL_ERROR",
    error instanceof Error ? error.message : "Lifecycle operation failed.",
  );
}
