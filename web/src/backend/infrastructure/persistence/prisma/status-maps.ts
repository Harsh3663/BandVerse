import type {
  ApplicationStatus as PrismaApplicationStatus,
  BookingStatus as PrismaBookingStatus,
  EventStatus as PrismaEventStatus,
  PaymentStatus as PrismaPaymentStatus,
  RoleName as PrismaRoleName,
} from "@prisma/client";

import type {
  ApplicationStatus,
  BookingStatus,
  MarketplaceEventStatus,
  PaymentStatus,
} from "@/modules/marketplace/types";
import { RoleName as DomainRoleName } from "@/backend/domain/enums";

export function toPrismaEventStatus(
  status: MarketplaceEventStatus,
): PrismaEventStatus {
  return status as PrismaEventStatus;
}

export function fromPrismaEventStatus(
  status: PrismaEventStatus,
): MarketplaceEventStatus {
  return status as MarketplaceEventStatus;
}

export function toPrismaApplicationStatus(
  status: ApplicationStatus,
): PrismaApplicationStatus {
  return status as PrismaApplicationStatus;
}

export function fromPrismaApplicationStatus(
  status: PrismaApplicationStatus,
): ApplicationStatus {
  return status as ApplicationStatus;
}

const bookingToPrisma: Record<BookingStatus, PrismaBookingStatus> = {
  requested: "requested",
  confirmed: "confirmed",
  "advance-pending": "advance_pending",
  "advance-paid": "advance_paid",
  completed: "completed",
  reviewed: "reviewed",
  cancelled: "cancelled",
  declined: "declined",
};

const bookingFromPrisma: Record<PrismaBookingStatus, BookingStatus> = {
  requested: "requested",
  confirmed: "confirmed",
  advance_pending: "advance-pending",
  advance_paid: "advance-paid",
  completed: "completed",
  reviewed: "reviewed",
  cancelled: "cancelled",
  declined: "declined",
};

export function toPrismaBookingStatus(status: BookingStatus): PrismaBookingStatus {
  return bookingToPrisma[status];
}

export function fromPrismaBookingStatus(
  status: PrismaBookingStatus,
): BookingStatus {
  return bookingFromPrisma[status];
}

const paymentToPrisma: Record<PaymentStatus, PrismaPaymentStatus> = {
  "not-started": "not_started",
  pending: "pending",
  authorized: "authorized",
  paid: "paid",
  failed: "failed",
  refunded: "refunded",
};

const paymentFromPrisma: Record<PrismaPaymentStatus, PaymentStatus> = {
  not_started: "not-started",
  pending: "pending",
  authorized: "authorized",
  paid: "paid",
  failed: "failed",
  refunded: "refunded",
};

export function toPrismaPaymentStatus(status: PaymentStatus): PrismaPaymentStatus {
  return paymentToPrisma[status];
}

export function fromPrismaPaymentStatus(
  status: PrismaPaymentStatus,
): PaymentStatus {
  return paymentFromPrisma[status];
}

const roleToPrisma: Record<DomainRoleName, PrismaRoleName> = {
  [DomainRoleName.GUEST]: "guest",
  [DomainRoleName.USER]: "user",
  [DomainRoleName.PERFORMER]: "performer",
  [DomainRoleName.ORGANIZER]: "organizer",
  [DomainRoleName.VENUE_MANAGER]: "venue_manager",
  [DomainRoleName.ADMIN]: "admin",
  [DomainRoleName.SUPPORT]: "support",
};

const roleFromPrisma: Record<PrismaRoleName, DomainRoleName> = {
  guest: DomainRoleName.GUEST,
  user: DomainRoleName.USER,
  performer: DomainRoleName.PERFORMER,
  organizer: DomainRoleName.ORGANIZER,
  venue_manager: DomainRoleName.VENUE_MANAGER,
  admin: DomainRoleName.ADMIN,
  support: DomainRoleName.SUPPORT,
};

export function toPrismaRoleName(role: DomainRoleName): PrismaRoleName {
  return roleToPrisma[role];
}

export function fromPrismaRoleName(role: PrismaRoleName): DomainRoleName {
  return roleFromPrisma[role];
}
