import type { AuthContext } from "@/backend/application/ports/services";
import { RoleName } from "@/backend/domain/enums";
import { forbiddenError } from "@/backend/shared/errors";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";

/** Reusable object-level ownership check (ABAC). Admins/support bypass. */
export function assertOwnership(
  context: AuthContext,
  partyUserIds: readonly (string | undefined | null)[],
  message = "You do not own this resource.",
): Result<true, AppError> {
  if (
    context.roles.includes(RoleName.ADMIN) ||
    context.roles.includes(RoleName.SUPPORT)
  ) {
    return ok(true);
  }
  const allowed = new Set(
    partyUserIds.filter((id): id is string => typeof id === "string" && id.length > 0),
  );
  if (allowed.has(context.userId)) return ok(true);
  return err(forbiddenError(message));
}

export function ownershipAttributes(ownerUserId: string | undefined) {
  return ownerUserId ? { ownerUserId } : undefined;
}
