import { filterPerformers, type PerformerQuery } from "./filters";
import {
  mockApplications,
  mockBookings,
  mockCalendarEntries,
  mockChatThreads,
  mockEvents,
  mockOrganizerPersona,
  mockPayments,
  mockPerformerProfiles,
  mockReviews,
  mockVenueProfiles,
} from "./mock-data";
import type {
  Application,
  ApplicationStatus,
  Booking,
  CalendarEntry,
  ChatThread,
  EntityId,
  MarketplaceEvent,
  MarketplaceEventInput,
  OrganizerApplicationContext,
  OrganizerBookingContext,
  OrganizerDashboardData,
  OrganizerPersona,
  PaymentPlaceholder,
  PerformerApplicationContext,
  PerformerProfile,
  Review,
  VenueProfile,
} from "./types";

export interface ReadRepository<T> {
  getById(id: EntityId): Promise<T | undefined>;
  list(): Promise<readonly T[]>;
}

export interface PerformerRepository extends ReadRepository<PerformerProfile> {
  getByHandle(handle: string): Promise<PerformerProfile | undefined>;
  query(filters: PerformerQuery): Promise<readonly PerformerProfile[]>;
}

export interface VenueRepository extends ReadRepository<VenueProfile> {
  getByHandle(handle: string): Promise<VenueProfile | undefined>;
}

export interface EventRepository extends ReadRepository<MarketplaceEvent> {
  listByHost(hostId: EntityId): Promise<readonly MarketplaceEvent[]>;
}

export interface MutableEventRepository extends EventRepository {
  create(hostId: EntityId, input: MarketplaceEventInput): Promise<MarketplaceEvent>;
  update(
    id: EntityId,
    input: MarketplaceEventInput,
  ): Promise<MarketplaceEvent | undefined>;
  duplicate(id: EntityId, hostId: EntityId): Promise<MarketplaceEvent | undefined>;
  archive(id: EntityId): Promise<MarketplaceEvent | undefined>;
  delete(id: EntityId): Promise<boolean>;
}

export interface ApplicationRepository extends ReadRepository<Application> {
  listByEvent(eventId: EntityId): Promise<readonly Application[]>;
  listByPerformer(performerId: EntityId): Promise<readonly Application[]>;
  listByPerformerAndStatus(
    performerId: EntityId,
    statuses: readonly ApplicationStatus[],
  ): Promise<readonly Application[]>;
}

export interface BookingRepository extends ReadRepository<Booking> {
  listByHost(hostId: EntityId): Promise<readonly Booking[]>;
  listByPerformer(performerId: EntityId): Promise<readonly Booking[]>;
  getByApplication(applicationId: EntityId): Promise<Booking | undefined>;
}

export interface ReviewRepository extends ReadRepository<Review> {
  listByPerformer(performerId: EntityId): Promise<readonly Review[]>;
}

export interface CalendarRepository extends ReadRepository<CalendarEntry> {
  listByOwner(
    ownerType: CalendarEntry["ownerType"],
    ownerId: EntityId,
  ): Promise<readonly CalendarEntry[]>;
}

export interface MarketplaceRepositories {
  performers: PerformerRepository;
  venues: VenueRepository;
  events: EventRepository;
  applications: ApplicationRepository;
  bookings: BookingRepository;
  reviews: ReviewRepository;
  payments: ReadRepository<PaymentPlaceholder>;
  chats: ReadRepository<ChatThread>;
  calendar: CalendarRepository;
}

function createReadRepository<T extends { id: EntityId }>(
  records: readonly T[],
): ReadRepository<T> {
  const index = new Map(records.map((record) => [record.id, record]));
  return {
    async getById(id) {
      return index.get(id);
    },
    async list() {
      return [...records];
    },
  };
}

export function createMockMarketplaceRepositories(): MarketplaceRepositories {
  const performers = createReadRepository(mockPerformerProfiles);
  const venues = createReadRepository(mockVenueProfiles);
  const events = createReadRepository(mockEvents);
  const applications = createReadRepository(mockApplications);
  const bookings = createReadRepository(mockBookings);
  const reviews = createReadRepository(mockReviews);

  return {
    performers: {
      ...performers,
      async getByHandle(handle) {
        return mockPerformerProfiles.find((profile) => profile.handle === handle);
      },
      async query(filters) {
        return filterPerformers(mockPerformerProfiles, filters);
      },
    },
    venues: {
      ...venues,
      async getByHandle(handle) {
        return mockVenueProfiles.find((venue) => venue.handle === handle);
      },
    },
    events: {
      ...events,
      async listByHost(hostId) {
        return mockEvents.filter((event) => event.hostId === hostId);
      },
    },
    applications: {
      ...applications,
      async listByEvent(eventId) {
        return mockApplications.filter((application) => application.eventId === eventId);
      },
      async listByPerformer(performerId) {
        return mockApplications.filter(
          (application) => application.performerId === performerId,
        );
      },
      async listByPerformerAndStatus(performerId, statuses) {
        return mockApplications.filter(
          (application) =>
            application.performerId === performerId &&
            statuses.includes(application.status),
        );
      },
    },
    bookings: {
      ...bookings,
      async listByHost(hostId) {
        return mockBookings.filter((booking) => booking.hostId === hostId);
      },
      async listByPerformer(performerId) {
        return mockBookings.filter((booking) => booking.performerId === performerId);
      },
      async getByApplication(applicationId) {
        return mockBookings.find((booking) => booking.applicationId === applicationId);
      },
    },
    reviews: {
      ...reviews,
      async listByPerformer(performerId) {
        return mockReviews.filter((review) => review.performerId === performerId);
      },
    },
    payments: createReadRepository(mockPayments),
    chats: createReadRepository(mockChatThreads),
    calendar: {
      ...createReadRepository(mockCalendarEntries),
      async listByOwner(ownerType, ownerId) {
        return mockCalendarEntries.filter(
          (entry) => entry.ownerType === ownerType && entry.ownerId === ownerId,
        );
      },
    },
  };
}

export const mockMarketplaceRepositories = createMockMarketplaceRepositories();

export async function listPerformerApplicationContexts(
  repositories: MarketplaceRepositories,
  performerId: EntityId,
): Promise<readonly PerformerApplicationContext[]> {
  const [applications, events, venues, bookings] = await Promise.all([
    repositories.applications.listByPerformer(performerId),
    repositories.events.list(),
    repositories.venues.list(),
    repositories.bookings.listByPerformer(performerId),
  ]);
  const eventById = new Map(events.map((event) => [event.id, event]));
  const venueById = new Map(venues.map((venue) => [venue.id, venue]));
  const bookingByApplicationId = new Map(
    bookings.flatMap((booking) =>
      booking.applicationId ? [[booking.applicationId, booking] as const] : [],
    ),
  );

  return applications.flatMap((application) => {
    const event = eventById.get(application.eventId);
    if (!event) return [];
    return [
      {
        application,
        event,
        venue: event.venueId ? venueById.get(event.venueId) : undefined,
        booking: bookingByApplicationId.get(application.id),
      },
    ];
  });
}

export async function resolveOrganizerDashboardData(
  repositories: MarketplaceRepositories,
  persona: OrganizerPersona = mockOrganizerPersona,
): Promise<OrganizerDashboardData | undefined> {
  const [venue, events, applications, performers, bookings] = await Promise.all([
    repositories.venues.getById(persona.venueId),
    repositories.events.listByHost(persona.hostId),
    repositories.applications.list(),
    repositories.performers.list(),
    repositories.bookings.listByHost(persona.hostId),
  ]);
  if (!venue) return undefined;

  const eventById = new Map(events.map((event) => [event.id, event]));
  const performerById = new Map(performers.map((performer) => [performer.id, performer]));
  const bookingByApplicationId = new Map(
    bookings.flatMap((booking) =>
      booking.applicationId ? [[booking.applicationId, booking] as const] : [],
    ),
  );

  const resolvedApplications: OrganizerApplicationContext[] = applications.flatMap(
    (application) => {
      const event = eventById.get(application.eventId);
      const performer = performerById.get(application.performerId);
      if (!event || !performer) return [];
      return [
        {
          application,
          event,
          performer,
          booking: bookingByApplicationId.get(application.id),
        },
      ];
    },
  );

  const resolvedBookings: OrganizerBookingContext[] = bookings.flatMap((booking) => {
    const event = eventById.get(booking.eventId);
    const performer = performerById.get(booking.performerId);
    return event && performer ? [{ booking, event, performer }] : [];
  });

  return {
    persona,
    venue,
    events: [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    applications: resolvedApplications.sort((a, b) =>
      b.application.updatedAt.localeCompare(a.application.updatedAt),
    ),
    bookings: resolvedBookings.sort((a, b) =>
      b.booking.updatedAt.localeCompare(a.booking.updatedAt),
    ),
  };
}

const activeBookingStatuses = new Set<Booking["status"]>([
  "requested",
  "confirmed",
  "advance-pending",
  "advance-paid",
]);

export function listOrganizerConfirmed(
  data: OrganizerDashboardData,
): readonly OrganizerApplicationContext[] {
  return data.applications.filter(
    ({ application, booking }) =>
      application.status === "accepted" ||
      (booking ? activeBookingStatuses.has(booking.status) : false),
  );
}

export function listOrganizerBookingHistory(
  data: OrganizerDashboardData,
): readonly OrganizerBookingContext[] {
  return data.bookings.filter(({ booking }) =>
    ["completed", "reviewed", "cancelled", "declined"].includes(booking.status),
  );
}
