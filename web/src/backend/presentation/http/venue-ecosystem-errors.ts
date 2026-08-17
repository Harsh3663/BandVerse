import { createAppError } from "@/backend/shared/errors";
import type { AppError } from "@/backend/shared/result";

export function toVenueEcosystemError(error: unknown): AppError {
  if (error && typeof error === "object" && "code" in error && "status" in error) {
    return error as AppError;
  }
  return createAppError(
    "INTERNAL_ERROR",
    error instanceof Error ? error.message : "Venue ecosystem operation failed.",
  );
}
