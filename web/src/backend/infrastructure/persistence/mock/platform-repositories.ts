import {
  createMockMarketplaceRepositories,
  type MarketplaceRepositories,
} from "@/modules/marketplace/repositories";
import { buildEventFromInput, createEventId } from "@/modules/marketplace/event-helpers";
import { filterPerformers } from "@/modules/marketplace/filters";
import {
  mockApplications,
  mockBookings,
  mockCalendarEntries,
  mockChatThreads,
  mockEvents,
  mockPayments,
  mockPerformerProfiles,
  mockReviews,
  mockVenueProfiles,
} from "@/modules/marketplace/mock-data";
import type {
  Contract,
  Notification,
  Offer,
  Verification,
} from "@/backend/domain/entities";
import type {
  ContractRepository,
  ConversationRepository,
  NotificationRepository,
  OfferRepository,
  PlatformRepositories,
  VerificationRepository,
} from "@/backend/application/ports/repositories";
import type { EntityId } from "@/backend/shared/types";
import type {
  Application,
  Booking,
  ChatThread,
  MarketplaceEvent,
  MarketplaceEventInput,
  PerformerProfile,
  Review,
  VenueProfile,
} from "@/modules/marketplace/types";

function createEmptyReadRepository<T extends { id: EntityId }>(
  records: readonly T[] = [],
) {
  const index = new Map(records.map((record) => [record.id, record]));
  return {
    async getById(id: EntityId) {
      return index.get(id);
    },
    async list() {
      return [...records];
    },
  };
}

export function createMockOfferRepository(
  records: readonly Offer[] = [],
): OfferRepository {
  const base = createEmptyReadRepository(records);
  return {
    ...base,
    async listByEvent(eventId) {
      return records.filter((offer) => offer.eventId === eventId);
    },
    async listByPerformer(performerId) {
      return records.filter((offer) => offer.performerId === performerId);
    },
  };
}

export function createMockContractRepository(
  records: readonly Contract[] = [],
): ContractRepository {
  const base = createEmptyReadRepository(records);
  return {
    ...base,
    async getByBooking(bookingId) {
      return records.find((contract) => contract.bookingId === bookingId);
    },
  };
}

export function createMockNotificationRepository(
  records: readonly Notification[] = [],
): NotificationRepository {
  const base = createEmptyReadRepository(records);
  return {
    ...base,
    async listByUser(userId) {
      return records.filter((notification) => notification.userId === userId);
    },
  };
}

export function createMockVerificationRepository(
  records: readonly Verification[] = [],
): VerificationRepository {
  const base = createEmptyReadRepository(records);
  return {
    ...base,
    async listBySubject(subjectType, subjectId) {
      return records.filter(
        (verification) =>
          verification.subjectType === subjectType &&
          verification.subjectId === subjectId,
      );
    },
  };
}

export function createMockConversationRepository(
  marketplace: MarketplaceRepositories,
): ConversationRepository {
  return {
    async getById(id) {
      return marketplace.chats.getById(id);
    },
    async list() {
      return marketplace.chats.list();
    },
    async listByParticipant(userId) {
      const threads = await marketplace.chats.list();
      return threads.filter((thread: ChatThread) =>
        thread.participants.some((participant) => participant.userId === userId),
      );
    },
  };
}

/**
 * Mutable in-memory platform repositories seeded from marketplace fixtures.
 * Used when DATABASE_URL is unset; Prisma repositories replace this in production.
 */
export function createMockPlatformRepositories(): PlatformRepositories {
  const performers = [...mockPerformerProfiles];
  const venues = [...mockVenueProfiles];
  const events = [...mockEvents];
  const applications = [...mockApplications];
  const bookings = [...mockBookings];
  const reviews = [...mockReviews];
  const payments = [...mockPayments];
  const calendar = [...mockCalendarEntries];
  const chats = [...mockChatThreads];

  const marketplaceShape = createMockMarketplaceRepositories();

  return {
    performers: {
      async getById(id) {
        return performers.find((item) => item.id === id);
      },
      async list() {
        return [...performers];
      },
      async getByHandle(handle) {
        return performers.find((item) => item.handle === handle);
      },
      async query(filters) {
        return filterPerformers(performers, filters);
      },
      async create(profile: PerformerProfile) {
        performers.push(profile);
        return profile;
      },
      async update(id: string, profile: PerformerProfile) {
        const index = performers.findIndex((item) => item.id === id);
        if (index < 0) throw new Error("Performer not found");
        performers[index] = profile;
        return profile;
      },
      async softDelete(id: string) {
        const index = performers.findIndex((item) => item.id === id);
        if (index >= 0) performers.splice(index, 1);
        return index >= 0;
      },
    } as PlatformRepositories["performers"],
    venues: {
      async getById(id) {
        return venues.find((item) => item.id === id);
      },
      async list() {
        return [...venues];
      },
      async getByHandle(handle) {
        return venues.find((item) => item.handle === handle);
      },
      async create(profile: VenueProfile) {
        venues.push(profile);
        return profile;
      },
      async update(id: string, profile: VenueProfile) {
        const index = venues.findIndex((item) => item.id === id);
        if (index < 0) throw new Error("Venue not found");
        venues[index] = profile;
        return profile;
      },
    } as PlatformRepositories["venues"],
    events: {
      async getById(id) {
        return events.find((item) => item.id === id);
      },
      async list() {
        return [...events];
      },
      async listByHost(hostId) {
        return events.filter((item) => item.hostId === hostId);
      },
      async create(hostId: string, input: MarketplaceEventInput) {
        const created = buildEventFromInput(input, hostId);
        events.push(created);
        return created;
      },
      async update(id: string, input: MarketplaceEventInput) {
        const index = events.findIndex((item) => item.id === id);
        if (index < 0) return undefined;
        const next = buildEventFromInput(input, events[index].hostId, events[index]);
        events[index] = next;
        return next;
      },
      async duplicate(id: string, hostId: string) {
        const existing = events.find((item) => item.id === id);
        if (!existing) return undefined;
        const copy: MarketplaceEvent = {
          ...existing,
          id: createEventId(`${existing.title}-copy`),
          hostId,
          title: `${existing.title} (Copy)`,
          status: "draft",
        };
        events.push(copy);
        return copy;
      },
      async archive(id: string) {
        const index = events.findIndex((item) => item.id === id);
        if (index < 0) return undefined;
        events[index] = { ...events[index], status: "archived" };
        return events[index];
      },
      async delete(id: string) {
        const index = events.findIndex((item) => item.id === id);
        if (index < 0) return false;
        events.splice(index, 1);
        return true;
      },
    } as PlatformRepositories["events"],
    applications: {
      async getById(id) {
        return applications.find((item) => item.id === id);
      },
      async list() {
        return [...applications];
      },
      async listByEvent(eventId) {
        return applications.filter((item) => item.eventId === eventId);
      },
      async listByPerformer(performerId) {
        return applications.filter((item) => item.performerId === performerId);
      },
      async listByPerformerAndStatus(performerId, statuses) {
        return applications.filter(
          (item) =>
            item.performerId === performerId && statuses.includes(item.status),
        );
      },
      async create(application: Application) {
        applications.push(application);
        return application;
      },
      async update(application: Application) {
        const index = applications.findIndex((item) => item.id === application.id);
        if (index < 0) throw new Error("Application not found");
        applications[index] = application;
        return application;
      },
    } as PlatformRepositories["applications"],
    bookings: {
      async getById(id) {
        return bookings.find((item) => item.id === id);
      },
      async list() {
        return [...bookings];
      },
      async listByHost(hostId) {
        return bookings.filter((item) => item.hostId === hostId);
      },
      async listByPerformer(performerId) {
        return bookings.filter((item) => item.performerId === performerId);
      },
      async getByApplication(applicationId) {
        return bookings.find((item) => item.applicationId === applicationId);
      },
      async create(booking: Booking) {
        bookings.push(booking);
        return booking;
      },
      async update(booking: Booking) {
        const index = bookings.findIndex((item) => item.id === booking.id);
        if (index < 0) throw new Error("Booking not found");
        bookings[index] = booking;
        return booking;
      },
    } as PlatformRepositories["bookings"],
    reviews: {
      async getById(id) {
        return reviews.find((item) => item.id === id);
      },
      async list() {
        return [...reviews];
      },
      async listByPerformer(performerId) {
        return reviews.filter((item) => item.performerId === performerId);
      },
      async create(review: Review) {
        reviews.push(review);
        return review;
      },
    } as PlatformRepositories["reviews"],
    payments: {
      async getById(id) {
        return payments.find((item) => item.id === id);
      },
      async list() {
        return [...payments];
      },
    },
    chats: {
      async getById(id) {
        return chats.find((item) => item.id === id);
      },
      async list() {
        return [...chats];
      },
    },
    calendar: {
      async getById(id) {
        return calendar.find((item) => item.id === id);
      },
      async list() {
        return [...calendar];
      },
      async listByOwner(ownerType, ownerId) {
        return calendar.filter(
          (item) => item.ownerType === ownerType && item.ownerId === ownerId,
        );
      },
    },
    offers: createMockOfferRepository(),
    contracts: createMockContractRepository(),
    notifications: createMockNotificationRepository(),
    verifications: createMockVerificationRepository(),
    conversations: createMockConversationRepository(marketplaceShape),
  };
}

export const mockPlatformRepositories = createMockPlatformRepositories();
