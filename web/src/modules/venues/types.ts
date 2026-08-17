/**
 * Venue & event ecosystem domain types.
 * Extends marketplace VenueProfile without replacing marketplace modules.
 */

export const VENUE_ECOSYSTEM_TYPES = [
  "hotel",
  "cafe",
  "restaurant",
  "resort",
  "wedding-hall",
  "banquet-hall",
  "club",
  "lounge",
  "corporate-venue",
  "college-venue",
  // legacy marketplace aliases kept for compatibility
  "wedding-venue",
  "corporate-office",
  "college",
] as const;

export type VenueEcosystemType = (typeof VENUE_ECOSYSTEM_TYPES)[number];

export const VENUE_AMENITY_IDS = [
  "stage",
  "sound-system",
  "lighting",
  "parking",
  "food",
  "accommodation",
] as const;

export type VenueAmenityId = (typeof VENUE_AMENITY_IDS)[number];

export interface VenueFacilities {
  readonly stageAvailable: boolean;
  readonly soundSystem: boolean;
  readonly lighting: boolean;
  readonly parking: boolean;
  readonly foodAvailable: boolean;
  readonly accommodationAvailable: boolean;
}

export interface VenueGalleryItem {
  readonly id: string;
  readonly venueId: string;
  readonly kind: "photo" | "video" | "virtual_tour";
  readonly title: string;
  readonly url: string;
  readonly thumbnail?: string;
  readonly createdAt: string;
}

export interface VenueVerification {
  readonly venueId: string;
  readonly gstVerified: boolean;
  readonly businessVerified: boolean;
  readonly phoneVerified: boolean;
  readonly emailVerified: boolean;
  readonly updatedAt: string;
}

export interface RecurringGig {
  readonly id: string;
  readonly venueId: string;
  readonly title: string;
  readonly description: string;
  /** ISO weekday 1=Monday … 7=Sunday, or named weekdays */
  readonly weekdays: readonly string[];
  readonly startTime: string;
  readonly endTime: string;
  readonly neededRoles: readonly string[];
  readonly preferredGenreIds: readonly string[];
  readonly budgetPaise?: number;
  readonly active: boolean;
  readonly activeFrom?: string;
  readonly activeUntil?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RecurringGigOccurrence {
  readonly gigId: string;
  readonly venueId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly title: string;
  readonly neededRoles: readonly string[];
}

export interface EventDiscoveryFilters {
  readonly city?: string;
  readonly budgetMin?: number;
  readonly budgetMax?: number;
  readonly category?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly performerType?: string;
}

export interface NearbyOpportunity {
  readonly id: string;
  readonly kind: "event" | "recurring_gig";
  readonly title: string;
  readonly city: string;
  readonly date?: string;
  readonly score: number;
  readonly reasons: readonly string[];
  readonly venueId?: string;
  readonly eventId?: string;
  readonly gigId?: string;
}

export interface VenueDashboardMetrics {
  readonly venueId: string;
  readonly bookings: number;
  readonly revenuePaise: number;
  readonly performerResponseRate: number;
  readonly upcomingEvents: number;
  readonly activeGigs: number;
}

export interface VenueAnalyticsSnapshot {
  readonly venueId: string;
  readonly totalEvents: number;
  readonly revenuePaise: number;
  readonly bookingConversion: number;
  readonly cancellationRate: number;
}

export function facilitiesFromAmenityIds(
  amenityIds: readonly string[],
): VenueFacilities {
  const set = new Set(amenityIds);
  return {
    stageAvailable: set.has("stage"),
    soundSystem: set.has("sound-system"),
    lighting: set.has("lighting"),
    parking: set.has("parking"),
    foodAvailable: set.has("food"),
    accommodationAvailable: set.has("accommodation"),
  };
}

export function amenityIdsFromFacilities(
  facilities: VenueFacilities,
): string[] {
  const ids: string[] = [];
  if (facilities.stageAvailable) ids.push("stage");
  if (facilities.soundSystem) ids.push("sound-system");
  if (facilities.lighting) ids.push("lighting");
  if (facilities.parking) ids.push("parking");
  if (facilities.foodAvailable) ids.push("food");
  if (facilities.accommodationAvailable) ids.push("accommodation");
  return ids;
}

export function isVenueEcosystemType(value: string): value is VenueEcosystemType {
  return (VENUE_ECOSYSTEM_TYPES as readonly string[]).includes(value);
}

/** Map ecosystem type labels to marketplace VenueType-compatible values. */
export function toMarketplaceVenueType(
  type: VenueEcosystemType,
):
  | "hotel"
  | "restaurant"
  | "resort"
  | "club"
  | "corporate-office"
  | "wedding-venue"
  | "college"
  | "cafe"
  | "banquet-hall"
  | "lounge"
  | "wedding-hall"
  | "corporate-venue"
  | "college-venue" {
  if (type === "corporate-venue") return "corporate-office";
  if (type === "wedding-hall") return "wedding-venue";
  if (type === "college-venue") return "college";
  return type;
}
