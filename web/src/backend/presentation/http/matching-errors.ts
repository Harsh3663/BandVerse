import { createAppError } from "@/backend/shared/errors";
import type { AppError } from "@/backend/shared/result";

export function toMatchingError(error: unknown): AppError {
  if (error && typeof error === "object" && "code" in error && "status" in error) {
    return error as AppError;
  }
  return createAppError(
    "INTERNAL_ERROR",
    error instanceof Error ? error.message : "Matching operation failed.",
  );
}
