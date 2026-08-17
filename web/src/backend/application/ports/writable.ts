import type {
  Application,
  Booking,
  MarketplaceEvent,
  MarketplaceEventInput,
  PerformerProfile,
  Review,
  VenueProfile,
} from "@/modules/marketplace/types";
import type {
  ApplicationRepository,
  BookingRepository,
  EventRepository,
  MutableEventRepository,
  PerformerRepository,
  ReviewRepository,
  VenueRepository,
} from "./repositories";

export interface WritablePerformerRepository extends PerformerRepository {
  create(profile: PerformerProfile, userId: string): Promise<PerformerProfile>;
  update(id: string, profile: PerformerProfile): Promise<PerformerProfile>;
  softDelete(id: string): Promise<boolean>;
}

export interface WritableVenueRepository extends VenueRepository {
  create(profile: VenueProfile, ownerUserId: string): Promise<VenueProfile>;
  update(id: string, profile: VenueProfile): Promise<VenueProfile>;
}

export interface WritableEventRepository
  extends EventRepository, MutableEventRepository {
  create(hostId: string, input: MarketplaceEventInput): Promise<MarketplaceEvent>;
  update(
    id: string,
    input: MarketplaceEventInput,
  ): Promise<MarketplaceEvent | undefined>;
  delete(id: string): Promise<boolean>;
}

export interface WritableApplicationRepository extends ApplicationRepository {
  create(application: Application): Promise<Application>;
  update(application: Application): Promise<Application>;
}

export interface WritableBookingRepository extends BookingRepository {
  create(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
}

export interface WritableReviewRepository extends ReviewRepository {
  create(review: Review): Promise<Review>;
}

export interface WritablePlatformRepositories {
  performers: WritablePerformerRepository;
  venues: WritableVenueRepository;
  events: WritableEventRepository;
  applications: WritableApplicationRepository;
  bookings: WritableBookingRepository;
  reviews: WritableReviewRepository;
}

export function asWritableRepositories(repositories: {
  performers: PerformerRepository;
  venues: VenueRepository;
  events: EventRepository;
  applications: ApplicationRepository;
  bookings: BookingRepository;
  reviews: ReviewRepository;
}): WritablePlatformRepositories {
  return repositories as unknown as WritablePlatformRepositories;
}
