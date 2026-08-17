import type { Booking } from "@/modules/marketplace/types";
import type { BookingRepository } from "@/backend/application/ports/repositories";
import { notFoundError } from "@/backend/shared/errors";
import { paginate, type PaginatedResult, type PaginationQuery } from "@/backend/shared/pagination";
import { err, ok, type AppError, type Result } from "@/backend/shared/result";
import type { BookingStatus } from "@/backend/domain/enums";
import {
  canTransitionBooking,
  transitionBooking,
} from "@/modules/marketplace/state-machines";
import { invalidTransitionError } from "@/backend/shared/errors";

export interface BookingListQuery extends PaginationQuery {
  hostId?: string;
  performerId?: string;
  status?: BookingStatus;
}

export async function listBookingsUseCase(
  repository: BookingRepository,
  query: BookingListQuery,
): Promise<Result<PaginatedResult<Booking>>> {
  let bookings: readonly Booking[];
  if (query.hostId) {
    bookings = await repository.listByHost(query.hostId);
  } else if (query.performerId) {
    bookings = await repository.listByPerformer(query.performerId);
  } else {
    bookings = await repository.list();
  }

  const filtered = bookings.filter((booking) => {
    if (query.status && booking.status !== query.status) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    query.sortOrder === "asc"
      ? a.updatedAt.localeCompare(b.updatedAt)
      : b.updatedAt.localeCompare(a.updatedAt),
  );

  return ok(paginate(sorted, query));
}

export async function getBookingByIdUseCase(
  repository: BookingRepository,
  id: string,
): Promise<Result<Booking, AppError>> {
  const booking = await repository.getById(id);
  if (!booking) return err(notFoundError("Booking", id));
  return ok(booking);
}

export function transitionBookingCommand(
  booking: Booking,
  to: BookingStatus,
  cancellationReason?: string,
): Result<Booking, AppError> {
  if (!canTransitionBooking(booking.status, to)) {
    return err(invalidTransitionError("booking", booking.status, to));
  }
  return ok(
    transitionBooking(booking, to, new Date().toISOString(), cancellationReason),
  );
}
