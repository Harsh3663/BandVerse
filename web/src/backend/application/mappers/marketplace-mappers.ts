import type {
  Application,
  Booking,
  MarketplaceEvent,
  PerformerProfile,
  VenueProfile,
} from "@/modules/marketplace/types";
import type {
  ApplicationEntity,
  BookingEntity,
  EventEntity,
  Performer,
  Venue,
} from "@/backend/domain/entities";

export function mapPerformerProfileToEntity(
  profile: PerformerProfile,
  userId = profile.id,
): Performer {
  return {
    id: profile.id,
    userId,
    profile,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    version: 1,
  };
}

export function mapVenueProfileToEntity(
  profile: VenueProfile,
  ownerUserId = profile.id,
): Venue {
  const now = new Date().toISOString();
  return {
    id: profile.id,
    ownerUserId,
    profile,
    type: profile.type,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

export function mapEventToEntity(event: MarketplaceEvent): EventEntity {
  const now = new Date().toISOString();
  return {
    id: event.id,
    data: event,
    status: event.status,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

export function mapBookingToEntity(booking: Booking): BookingEntity {
  return {
    id: booking.id,
    data: booking,
    status: booking.status,
    createdAt: booking.requestedAt,
    updatedAt: booking.updatedAt,
    version: 1,
  };
}

export function mapApplicationToEntity(application: Application): ApplicationEntity {
  return {
    id: application.id,
    data: application,
    status: application.status,
    createdAt: application.submittedAt,
    updatedAt: application.updatedAt,
    version: 1,
  };
}
