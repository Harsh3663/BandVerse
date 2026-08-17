import type {
  Application as PrismaApplication,
  Booking as PrismaBooking,
  Event as PrismaEvent,
  Payment as PrismaPayment,
  Performer as PrismaPerformer,
  Review as PrismaReview,
  Venue as PrismaVenue,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";

import type {
  Application,
  Booking,
  MarketplaceEvent,
  PaymentPlaceholder,
  PerformerProfile,
  Review,
  VenueProfile,
} from "@/modules/marketplace/types";
import {
  fromPrismaApplicationStatus,
  fromPrismaBookingStatus,
  fromPrismaEventStatus,
  fromPrismaPaymentStatus,
  toPrismaApplicationStatus,
  toPrismaBookingStatus,
  toPrismaEventStatus,
} from "./status-maps";

function asJson<T>(value: Prisma.JsonValue): T {
  return value as T;
}

export function performerRowToProfile(row: PrismaPerformer): PerformerProfile {
  const profile = asJson<PerformerProfile>(row.profileJson);
  return {
    ...profile,
    id: row.id,
    handle: row.handle,
    kind: row.kind as PerformerProfile["kind"],
    displayName: row.displayName,
    headline: row.headline,
    biography: row.biography,
    verified: row.verified,
    rating: {
      ...profile.rating,
      average: row.ratingAvg,
      count: row.ratingCount,
    },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function profileToPerformerCreate(
  profile: PerformerProfile,
  userId: string,
): Prisma.PerformerCreateInput {
  return {
    id: profile.id,
    user: { connect: { id: userId } },
    handle: profile.handle,
    kind: profile.kind,
    displayName: profile.displayName,
    headline: profile.headline,
    biography: profile.biography,
    city: profile.travel.baseLocation.city,
    state: profile.travel.baseLocation.state,
    verified: profile.verified,
    ratingAvg: profile.rating.average,
    ratingCount: profile.rating.count,
    profileJson: profile as unknown as Prisma.InputJsonValue,
  };
}

export function venueRowToProfile(row: PrismaVenue): VenueProfile {
  const profile = asJson<VenueProfile>(row.profileJson);
  return {
    ...profile,
    id: row.id,
    handle: row.handle,
    name: row.name,
    type: row.type as VenueProfile["type"],
    verified: row.verified,
  };
}

export function profileToVenueCreate(
  profile: VenueProfile,
  ownerUserId: string,
): Prisma.VenueCreateInput {
  return {
    id: profile.id,
    ownerUserId,
    handle: profile.handle,
    name: profile.name,
    type: profile.type,
    city: profile.location.city,
    state: profile.location.state,
    verified: profile.verified,
    profileJson: profile as unknown as Prisma.InputJsonValue,
  };
}

export function eventRowToDomain(row: PrismaEvent): MarketplaceEvent {
  const payload = asJson<MarketplaceEvent>(row.payloadJson);
  return {
    ...payload,
    id: row.id,
    hostId: row.hostId,
    venueId: row.venueId ?? undefined,
    eventTypeId: row.eventTypeId,
    title: row.title,
    description: row.description ?? undefined,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    status: fromPrismaEventStatus(row.status),
    budget: {
      minimum:
        row.budgetMinPaise != null
          ? { amount: row.budgetMinPaise / 100, currency: "INR" }
          : payload.budget.minimum,
      maximum: { amount: row.budgetMaxPaise / 100, currency: "INR" },
    },
    location: {
      ...payload.location,
      city: row.city,
      state: row.state,
    },
  };
}

export function eventToPrismaCreate(
  event: MarketplaceEvent,
  organizerId?: string | null,
): Prisma.EventCreateInput {
  return {
    id: event.id,
    hostId: event.hostId,
    organizer: organizerId ? { connect: { id: organizerId } } : undefined,
    venue: event.venueId ? { connect: { id: event.venueId } } : undefined,
    eventTypeId: event.eventTypeId,
    title: event.title,
    description: event.description,
    startsAt: new Date(event.startsAt),
    endsAt: new Date(event.endsAt),
    city: event.location.city,
    state: event.location.state,
    budgetMaxPaise: Math.round(event.budget.maximum.amount * 100),
    budgetMinPaise:
      event.budget.minimum != null
        ? Math.round(event.budget.minimum.amount * 100)
        : null,
    status: toPrismaEventStatus(event.status),
    payloadJson: event as unknown as Prisma.InputJsonValue,
  };
}

export function applicationRowToDomain(row: PrismaApplication): Application {
  return {
    id: row.id,
    eventId: row.eventId,
    performerId: row.performerId,
    proposedPackageId: row.proposedPackageId ?? undefined,
    quotedPrice: { amount: row.quotedPaise / 100, currency: "INR" },
    message: row.message,
    status: fromPrismaApplicationStatus(row.status),
    submittedAt: row.submittedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function applicationToPrismaCreate(
  application: Application,
): Prisma.ApplicationUncheckedCreateInput {
  return {
    id: application.id,
    eventId: application.eventId,
    performerId: application.performerId,
    proposedPackageId: application.proposedPackageId,
    quotedPaise: Math.round(application.quotedPrice.amount * 100),
    currency: application.quotedPrice.currency,
    message: application.message,
    status: toPrismaApplicationStatus(application.status),
    submittedAt: new Date(application.submittedAt),
    updatedAt: new Date(application.updatedAt),
  };
}

export function bookingRowToDomain(row: PrismaBooking): Booking {
  return {
    id: row.id,
    eventId: row.eventId,
    performerId: row.performerId,
    hostId: row.hostId,
    applicationId: row.applicationId ?? undefined,
    packageId: row.packageId ?? undefined,
    agreedPrice: { amount: row.agreedPaise / 100, currency: "INR" },
    status: fromPrismaBookingStatus(row.status),
    requestedAt: row.requestedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    cancellationReason: row.cancellationReason ?? undefined,
  };
}

export function bookingToPrismaCreate(
  booking: Booking,
  organizerId?: string | null,
): Prisma.BookingUncheckedCreateInput {
  return {
    id: booking.id,
    eventId: booking.eventId,
    performerId: booking.performerId,
    hostId: booking.hostId,
    organizerId: organizerId ?? null,
    applicationId: booking.applicationId,
    packageId: booking.packageId,
    agreedPaise: Math.round(booking.agreedPrice.amount * 100),
    currency: booking.agreedPrice.currency,
    status: toPrismaBookingStatus(booking.status),
    cancellationReason: booking.cancellationReason,
    requestedAt: new Date(booking.requestedAt),
    updatedAt: new Date(booking.updatedAt),
  };
}

export function reviewRowToDomain(row: PrismaReview): Review {
  return {
    id: row.id,
    bookingId: row.bookingId,
    performerId: row.performerId,
    reviewerId: row.reviewerId,
    rating: row.rating as Review["rating"],
    title: row.title ?? undefined,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
    verifiedBooking: row.verifiedBooking,
  };
}

export function paymentRowToDomain(row: PrismaPayment): PaymentPlaceholder {
  return {
    id: row.id,
    bookingId: row.bookingId,
    kind: row.kind as PaymentPlaceholder["kind"],
    amount: { amount: row.amountPaise / 100, currency: "INR" },
    status: fromPrismaPaymentStatus(row.status),
    providerReference: row.providerReference ?? undefined,
    dueAt: row.dueAt?.toISOString(),
    paidAt: row.paidAt?.toISOString(),
  };
}
