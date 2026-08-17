/**
 * BandVerse booking lifecycle state machine (backend).
 * Separate from marketplace UI booking statuses to avoid breaking completed modules.
 */

export const BookingLifecycleStatus = {
  DRAFT: "draft",
  INVITED: "invited",
  APPLIED: "applied",
  SHORTLISTED: "shortlisted",
  NEGOTIATING: "negotiating",
  CONFIRMED: "confirmed",
  ADVANCE_PAID: "advance_paid",
  CONTRACT_SIGNED: "contract_signed",
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
} as const;

export type BookingLifecycleStatus =
  (typeof BookingLifecycleStatus)[keyof typeof BookingLifecycleStatus];

export const bookingLifecycleTransitions = {
  draft: ["invited", "applied", "cancelled"],
  invited: ["applied", "cancelled"],
  applied: ["shortlisted", "negotiating", "cancelled"],
  shortlisted: ["negotiating", "confirmed", "cancelled"],
  negotiating: ["confirmed", "cancelled", "disputed"],
  confirmed: ["advance_paid", "cancelled", "disputed"],
  advance_paid: ["contract_signed", "cancelled", "disputed"],
  contract_signed: ["upcoming", "cancelled", "disputed"],
  upcoming: ["completed", "cancelled", "disputed"],
  completed: ["disputed"],
  cancelled: [],
  disputed: ["cancelled", "completed"],
} as const satisfies Record<
  BookingLifecycleStatus,
  readonly BookingLifecycleStatus[]
>;

export function canTransitionLifecycle(
  from: BookingLifecycleStatus,
  to: BookingLifecycleStatus,
): boolean {
  return (
    bookingLifecycleTransitions[from] as readonly BookingLifecycleStatus[]
  ).includes(to);
}

export function assertLifecycleTransition(
  from: BookingLifecycleStatus,
  to: BookingLifecycleStatus,
): void {
  if (!canTransitionLifecycle(from, to)) {
    throw Object.assign(
      new Error(`Invalid booking lifecycle transition: ${from} -> ${to}`),
      { code: "INVALID_TRANSITION", status: 409 },
    );
  }
}

export interface BookingTimelineEntry {
  readonly id: string;
  readonly lifecycleId: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly fromStatus?: BookingLifecycleStatus;
  readonly toStatus?: BookingLifecycleStatus;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}

export interface LifecycleContract {
  readonly id: string;
  readonly lifecycleId: string;
  readonly bookingId?: string;
  readonly terms: string;
  readonly performanceDate: string;
  readonly durationMinutes: number;
  readonly feePaise: number;
  readonly currency: string;
  readonly status: "draft" | "signed";
  readonly createdAt: string;
  readonly signedAt?: string;
}

export interface BookingLifecycleRecord {
  readonly id: string;
  readonly eventId: string;
  readonly performerId: string;
  readonly hostId: string;
  readonly applicationId?: string;
  readonly bookingId?: string;
  readonly status: BookingLifecycleStatus;
  readonly agreedPaise?: number;
  readonly currency: string;
  readonly advancePaymentId?: string;
  readonly balancePaymentId?: string;
  readonly refundPaymentId?: string;
  readonly contractId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}
