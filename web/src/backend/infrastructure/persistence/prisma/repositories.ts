import type { PrismaClient } from "@prisma/client";

import { filterPerformers, type PerformerQuery } from "@/modules/marketplace/filters";
import type {
  Application,
  Booking,
  CalendarEntry,
  MarketplaceEvent,
  MarketplaceEventInput,
  PerformerProfile,
  Review,
  VenueProfile,
} from "@/modules/marketplace/types";
import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import {
  createMockContractRepository,
  createMockConversationRepository,
  createMockNotificationRepository,
  createMockOfferRepository,
  createMockVerificationRepository,
} from "../mock/platform-repositories";
import { createMockMarketplaceRepositories } from "@/modules/marketplace/repositories";
import {
  applicationRowToDomain,
  applicationToPrismaCreate,
  bookingRowToDomain,
  bookingToPrismaCreate,
  eventRowToDomain,
  eventToPrismaCreate,
  paymentRowToDomain,
  performerRowToProfile,
  profileToPerformerCreate,
  profileToVenueCreate,
  reviewRowToDomain,
  venueRowToProfile,
} from "./mappers";
import {
  toPrismaApplicationStatus,
  toPrismaBookingStatus,
  toPrismaEventStatus,
} from "./status-maps";

function combineDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00.000Z`);
}

function eventFromInput(
  id: string,
  hostId: string,
  input: MarketplaceEventInput,
  venue?: VenueProfile,
): MarketplaceEvent {
  const startsAt = combineDateTime(input.eventDate, input.startTime).toISOString();
  const endsAt = combineDateTime(input.eventDate, input.endTime).toISOString();
  return {
    id,
    hostId,
    venueId: input.venueId,
    eventTypeId: input.eventTypeId,
    title: input.title,
    description: input.description,
    startsAt,
    endsAt,
    location: {
      city: input.city,
      state: venue?.location.state ?? "Maharashtra",
      countryCode: "IN",
      line1: venue?.location.line1,
    },
    audienceSize: input.audienceSize,
    budget: {
      minimum:
        input.budgetMinimum != null
          ? { amount: input.budgetMinimum, currency: "INR" }
          : undefined,
      maximum: { amount: input.budgetMaximum, currency: "INR" },
    },
    dressCode: input.dressCode,
    theme: input.theme,
    languageIds: input.languageIds,
    preferredGenreIds: input.preferredGenreIds,
    preferredInstrumentIds: [],
    specialRequirements: input.specialRequirements,
    timeline: input.timeline,
    customFieldValues: {},
    status: input.status,
  };
}

export function createPrismaPlatformRepositories(
  prisma: PrismaClient,
): PlatformRepositories {
  const mockFallback = createMockMarketplaceRepositories();

  const performers = {
    async getById(id: string) {
      const row = await prisma.performer.findFirst({
        where: { id, deletedAt: null },
      });
      return row ? performerRowToProfile(row) : undefined;
    },
    async list() {
      const rows = await prisma.performer.findMany({
        where: { deletedAt: null },
        orderBy: [{ ratingAvg: "desc" }, { displayName: "asc" }],
      });
      return rows.map(performerRowToProfile);
    },
    async getByHandle(handle: string) {
      const row = await prisma.performer.findFirst({
        where: { handle, deletedAt: null },
      });
      return row ? performerRowToProfile(row) : undefined;
    },
    async query(filters: PerformerQuery) {
      const rows = await prisma.performer.findMany({
        where: {
          deletedAt: null,
          ...(filters.city
            ? { city: { equals: filters.city, mode: "insensitive" as const } }
            : {}),
          ...(filters.minimumRating != null
            ? { ratingAvg: { gte: filters.minimumRating } }
            : {}),
        },
      });
      return filterPerformers(rows.map(performerRowToProfile), filters);
    },
    async create(profile: PerformerProfile, userId: string) {
      const row = await prisma.performer.create({
        data: profileToPerformerCreate(profile, userId),
      });
      return performerRowToProfile(row);
    },
    async update(id: string, profile: PerformerProfile) {
      const row = await prisma.performer.update({
        where: { id },
        data: {
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
          profileJson: profile as object,
          version: { increment: 1 },
          deletedAt: null,
        },
      });
      return performerRowToProfile(row);
    },
    async softDelete(id: string) {
      await prisma.performer.update({
        where: { id },
        data: { deletedAt: new Date(), version: { increment: 1 } },
      });
      return true;
    },
  };

  const venues = {
    async getById(id: string) {
      const row = await prisma.venue.findFirst({ where: { id, deletedAt: null } });
      return row ? venueRowToProfile(row) : undefined;
    },
    async list() {
      const rows = await prisma.venue.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      });
      return rows.map(venueRowToProfile);
    },
    async getByHandle(handle: string) {
      const row = await prisma.venue.findFirst({
        where: { handle, deletedAt: null },
      });
      return row ? venueRowToProfile(row) : undefined;
    },
    async create(profile: VenueProfile, ownerUserId: string) {
      const row = await prisma.venue.create({
        data: profileToVenueCreate(profile, ownerUserId),
      });
      return venueRowToProfile(row);
    },
    async update(id: string, profile: VenueProfile) {
      const row = await prisma.venue.update({
        where: { id },
        data: {
          handle: profile.handle,
          name: profile.name,
          type: profile.type,
          city: profile.location.city,
          state: profile.location.state,
          verified: profile.verified,
          profileJson: profile as object,
          version: { increment: 1 },
        },
      });
      return venueRowToProfile(row);
    },
  };

  const events = {
    async getById(id: string) {
      const row = await prisma.event.findFirst({ where: { id, deletedAt: null } });
      return row ? eventRowToDomain(row) : undefined;
    },
    async list() {
      const rows = await prisma.event.findMany({
        where: { deletedAt: null },
        orderBy: { startsAt: "desc" },
      });
      return rows.map(eventRowToDomain);
    },
    async listByHost(hostId: string) {
      const rows = await prisma.event.findMany({
        where: { hostId, deletedAt: null },
        orderBy: { startsAt: "asc" },
      });
      return rows.map(eventRowToDomain);
    },
    async create(hostId: string, input: MarketplaceEventInput) {
      const venue = input.venueId
        ? await venues.getById(input.venueId)
        : undefined;
      const event = eventFromInput(crypto.randomUUID(), hostId, input, venue);
      const organizer = await prisma.organizer.findFirst({
        where: { hostId, deletedAt: null },
      });
      const row = await prisma.event.create({
        data: eventToPrismaCreate(event, organizer?.id),
      });
      return eventRowToDomain(row);
    },
    async update(id: string, input: MarketplaceEventInput) {
      const existing = await events.getById(id);
      if (!existing) return undefined;
      const venue = input.venueId
        ? await venues.getById(input.venueId)
        : undefined;
      const next = eventFromInput(id, existing.hostId, input, venue);
      const row = await prisma.event.update({
        where: { id },
        data: {
          venueId: next.venueId,
          eventTypeId: next.eventTypeId,
          title: next.title,
          description: next.description,
          startsAt: new Date(next.startsAt),
          endsAt: new Date(next.endsAt),
          city: next.location.city,
          state: next.location.state,
          budgetMaxPaise: Math.round(next.budget.maximum.amount * 100),
          budgetMinPaise:
            next.budget.minimum != null
              ? Math.round(next.budget.minimum.amount * 100)
              : null,
          status: toPrismaEventStatus(next.status),
          payloadJson: next as object,
          version: { increment: 1 },
        },
      });
      return eventRowToDomain(row);
    },
    async duplicate(id: string, hostId: string) {
      const existing = await events.getById(id);
      if (!existing) return undefined;
      const copy: MarketplaceEvent = {
        ...existing,
        id: crypto.randomUUID(),
        hostId,
        title: `${existing.title} (Copy)`,
        status: "draft",
      };
      const organizer = await prisma.organizer.findFirst({
        where: { hostId, deletedAt: null },
      });
      const row = await prisma.event.create({
        data: eventToPrismaCreate(copy, organizer?.id),
      });
      return eventRowToDomain(row);
    },
    async archive(id: string) {
      const row = await prisma.event.update({
        where: { id },
        data: {
          status: "archived",
          version: { increment: 1 },
        },
      });
      return eventRowToDomain(row);
    },
    async delete(id: string) {
      await prisma.event.update({
        where: { id },
        data: { deletedAt: new Date(), status: "archived", version: { increment: 1 } },
      });
      return true;
    },
  };

  const applications = {
    async getById(id: string) {
      const row = await prisma.application.findFirst({
        where: { id, deletedAt: null },
      });
      return row ? applicationRowToDomain(row) : undefined;
    },
    async list() {
      const rows = await prisma.application.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(applicationRowToDomain);
    },
    async listByEvent(eventId: string) {
      const rows = await prisma.application.findMany({
        where: { eventId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(applicationRowToDomain);
    },
    async listByPerformer(performerId: string) {
      const rows = await prisma.application.findMany({
        where: { performerId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(applicationRowToDomain);
    },
    async listByPerformerAndStatus(
      performerId: string,
      statuses: readonly Application["status"][],
    ) {
      const rows = await prisma.application.findMany({
        where: {
          performerId,
          deletedAt: null,
          status: { in: statuses.map(toPrismaApplicationStatus) },
        },
      });
      return rows.map(applicationRowToDomain);
    },
    async create(application: Application) {
      const row = await prisma.application.create({
        data: applicationToPrismaCreate(application),
      });
      return applicationRowToDomain(row);
    },
    async update(application: Application) {
      const row = await prisma.application.update({
        where: { id: application.id },
        data: {
          status: toPrismaApplicationStatus(application.status),
          message: application.message,
          quotedPaise: Math.round(application.quotedPrice.amount * 100),
          proposedPackageId: application.proposedPackageId,
          updatedAt: new Date(application.updatedAt),
          version: { increment: 1 },
        },
      });
      return applicationRowToDomain(row);
    },
  };

  const bookings = {
    async getById(id: string) {
      const row = await prisma.booking.findFirst({
        where: { id, deletedAt: null },
      });
      return row ? bookingRowToDomain(row) : undefined;
    },
    async list() {
      const rows = await prisma.booking.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(bookingRowToDomain);
    },
    async listByHost(hostId: string) {
      const rows = await prisma.booking.findMany({
        where: { hostId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(bookingRowToDomain);
    },
    async listByPerformer(performerId: string) {
      const rows = await prisma.booking.findMany({
        where: { performerId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(bookingRowToDomain);
    },
    async getByApplication(applicationId: string) {
      const row = await prisma.booking.findFirst({
        where: { applicationId, deletedAt: null },
      });
      return row ? bookingRowToDomain(row) : undefined;
    },
    async create(booking: Booking) {
      const organizer = await prisma.organizer.findFirst({
        where: { hostId: booking.hostId, deletedAt: null },
      });
      const row = await prisma.booking.create({
        data: bookingToPrismaCreate(booking, organizer?.id),
      });
      return bookingRowToDomain(row);
    },
    async update(booking: Booking) {
      const versionValue = (booking as unknown as { version?: number }).version;
      const expectedVersion =
        typeof versionValue === "number" ? versionValue : undefined;
      const result = await prisma.booking.updateMany({
        where: {
          id: booking.id,
          deletedAt: null,
          ...(expectedVersion != null ? { version: expectedVersion } : {}),
        },
        data: {
          status: toPrismaBookingStatus(booking.status),
          cancellationReason: booking.cancellationReason,
          agreedPaise: Math.round(booking.agreedPrice.amount * 100),
          updatedAt: new Date(booking.updatedAt),
          version: { increment: 1 },
        },
      });
      if (result.count === 0) {
        throw Object.assign(new Error("Booking version conflict."), {
          code: "CONFLICT",
          status: 409,
        });
      }
      const row = await prisma.booking.findUniqueOrThrow({
        where: { id: booking.id },
      });
      return bookingRowToDomain(row);
    },
  };

  const reviews = {
    async getById(id: string) {
      const row = await prisma.review.findFirst({
        where: { id, deletedAt: null },
      });
      return row ? reviewRowToDomain(row) : undefined;
    },
    async list() {
      const rows = await prisma.review.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(reviewRowToDomain);
    },
    async listByPerformer(performerId: string) {
      const rows = await prisma.review.findMany({
        where: { performerId, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(reviewRowToDomain);
    },
    async create(review: Review) {
      const row = await prisma.review.create({
        data: {
          id: review.id,
          bookingId: review.bookingId,
          performerId: review.performerId,
          reviewerId: review.reviewerId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          verifiedBooking: review.verifiedBooking,
          createdAt: new Date(review.createdAt),
        },
      });
      return reviewRowToDomain(row);
    },
  };

  const payments = {
    async getById(id: string) {
      const row = await prisma.payment.findFirst({
        where: { id, deletedAt: null },
      });
      return row ? paymentRowToDomain(row) : undefined;
    },
    async list() {
      const rows = await prisma.payment.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(paymentRowToDomain);
    },
  };

  const calendar = {
    async getById(id: string) {
      const row = await prisma.availabilitySlot.findUnique({ where: { id } });
      if (!row) return undefined;
      return {
        id: row.id,
        ownerType: row.ownerType as CalendarEntry["ownerType"],
        ownerId: row.ownerId,
        title: `${row.status}`,
        startsAt: row.startsAt.toISOString(),
        endsAt: row.endsAt.toISOString(),
        status: row.status as CalendarEntry["status"],
        relatedBookingId: row.relatedBookingId ?? undefined,
      } satisfies CalendarEntry;
    },
    async list() {
      const rows = await prisma.availabilitySlot.findMany({
        orderBy: { startsAt: "asc" },
      });
      return rows.map(
        (row) =>
          ({
            id: row.id,
            ownerType: row.ownerType as CalendarEntry["ownerType"],
            ownerId: row.ownerId,
            title: `${row.status}`,
            startsAt: row.startsAt.toISOString(),
            endsAt: row.endsAt.toISOString(),
            status: row.status as CalendarEntry["status"],
            relatedBookingId: row.relatedBookingId ?? undefined,
          }) satisfies CalendarEntry,
      );
    },
    async listByOwner(ownerType: CalendarEntry["ownerType"], ownerId: string) {
      const rows = await prisma.availabilitySlot.findMany({
        where: { ownerType, ownerId },
        orderBy: { startsAt: "asc" },
      });
      return rows.map(
        (row) =>
          ({
            id: row.id,
            ownerType: row.ownerType as CalendarEntry["ownerType"],
            ownerId: row.ownerId,
            title: `${row.status}`,
            startsAt: row.startsAt.toISOString(),
            endsAt: row.endsAt.toISOString(),
            status: row.status as CalendarEntry["status"],
            relatedBookingId: row.relatedBookingId ?? undefined,
          }) satisfies CalendarEntry,
      );
    },
  };

  return {
    performers,
    venues,
    events,
    applications,
    bookings,
    reviews,
    payments,
    chats: mockFallback.chats,
    calendar,
    offers: createMockOfferRepository(),
    contracts: createMockContractRepository(),
    notifications: createMockNotificationRepository(),
    verifications: createMockVerificationRepository(),
    conversations: createMockConversationRepository(mockFallback),
  };
}

export type PrismaWritablePerformers = ReturnType<
  typeof createPrismaPlatformRepositories
>["performers"];
