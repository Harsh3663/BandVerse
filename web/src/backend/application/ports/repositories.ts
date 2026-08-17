/**
 * Application-layer repository ports.
 * Re-exports and extends marketplace repository contracts without duplication.
 */

export type {
  ApplicationRepository,
  BookingRepository,
  CalendarRepository,
  EventRepository,
  MarketplaceRepositories,
  MutableEventRepository,
  PerformerRepository,
  ReadRepository,
  ReviewRepository,
  VenueRepository,
} from "@/modules/marketplace/repositories";

import type {
  ApplicationRepository,
  BookingRepository,
  CalendarRepository,
  EventRepository,
  MarketplaceRepositories,
  PerformerRepository,
  ReadRepository,
  ReviewRepository,
  VenueRepository,
} from "@/modules/marketplace/repositories";
import type {
  ChatThread,
  PaymentPlaceholder,
} from "@/modules/marketplace/types";
import type {
  Contract,
  Notification,
  Offer,
  Verification,
} from "@/backend/domain/entities";
import type { EntityId } from "@/backend/shared/types";

export interface OfferRepository extends ReadRepository<Offer> {
  listByEvent(eventId: EntityId): Promise<readonly Offer[]>;
  listByPerformer(performerId: EntityId): Promise<readonly Offer[]>;
}

export interface ContractRepository extends ReadRepository<Contract> {
  getByBooking(bookingId: EntityId): Promise<Contract | undefined>;
}

export interface NotificationRepository extends ReadRepository<Notification> {
  listByUser(userId: EntityId): Promise<readonly Notification[]>;
}

export interface VerificationRepository extends ReadRepository<Verification> {
  listBySubject(
    subjectType: Verification["subjectType"],
    subjectId: EntityId,
  ): Promise<readonly Verification[]>;
}

export interface ConversationRepository extends ReadRepository<ChatThread> {
  listByParticipant(userId: EntityId): Promise<readonly ChatThread[]>;
}

export interface PlatformRepositories extends MarketplaceRepositories {
  offers: OfferRepository;
  contracts: ContractRepository;
  notifications: NotificationRepository;
  verifications: VerificationRepository;
  conversations: ConversationRepository;
  payments: ReadRepository<PaymentPlaceholder>;
}

export type CoreRepositoryBundle = {
  performers: PerformerRepository;
  venues: VenueRepository;
  events: EventRepository;
  applications: ApplicationRepository;
  bookings: BookingRepository;
  reviews: ReviewRepository;
  calendar: CalendarRepository;
};
