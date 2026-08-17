import type {
  Application,
  ApplicationStatus,
  Booking,
  BookingStatus,
  ISODateTime,
} from "./types";

export class InvalidMarketplaceTransitionError extends Error {
  constructor(
    readonly entity: "application" | "booking",
    readonly from: string,
    readonly to: string,
  ) {
    super(`Invalid ${entity} status transition: ${from} -> ${to}`);
    this.name = "InvalidMarketplaceTransitionError";
  }
}

export const applicationTransitions = {
  submitted: ["shortlisted", "accepted", "rejected", "cancelled", "withdrawn"],
  shortlisted: ["accepted", "rejected", "cancelled", "withdrawn"],
  accepted: ["completed", "cancelled"],
  rejected: [],
  completed: [],
  cancelled: [],
  withdrawn: [],
} as const satisfies Record<ApplicationStatus, readonly ApplicationStatus[]>;

export const bookingTransitions = {
  requested: ["confirmed", "declined", "cancelled"],
  confirmed: ["advance-pending", "cancelled"],
  "advance-pending": ["advance-paid", "cancelled"],
  "advance-paid": ["completed", "cancelled"],
  completed: ["reviewed"],
  reviewed: [],
  cancelled: [],
  declined: [],
} as const satisfies Record<BookingStatus, readonly BookingStatus[]>;

export function canTransitionApplication(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return (applicationTransitions[from] as readonly ApplicationStatus[]).includes(to);
}

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return (bookingTransitions[from] as readonly BookingStatus[]).includes(to);
}

export function transitionApplication(
  application: Application,
  to: ApplicationStatus,
  updatedAt: ISODateTime,
): Application {
  if (!canTransitionApplication(application.status, to)) {
    throw new InvalidMarketplaceTransitionError("application", application.status, to);
  }

  return { ...application, status: to, updatedAt };
}

export function transitionBooking(
  booking: Booking,
  to: BookingStatus,
  updatedAt: ISODateTime,
  cancellationReason?: string,
): Booking {
  if (!canTransitionBooking(booking.status, to)) {
    throw new InvalidMarketplaceTransitionError("booking", booking.status, to);
  }

  return {
    ...booking,
    status: to,
    updatedAt,
    cancellationReason: to === "cancelled" ? cancellationReason : undefined,
  };
}
