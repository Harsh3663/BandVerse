import type { StaticImageData } from "next/image";

import type {
  AwardKind,
  PerformanceHistoryItem,
  PerformerVerification,
  PortfolioMediaItem,
  ReviewKind,
  SocialProofMetrics,
} from "@/modules/media";

export type EntityId = string;
export type ISODate = string;
export type ISODateTime = string;
export type CurrencyCode = "INR";

export type {
  AwardKind,
  PerformanceHistoryItem,
  PerformerVerification,
  PortfolioMediaItem,
  ReviewKind,
  SocialProofMetrics,
};

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  line1?: string;
  line2?: string;
  locality?: string;
  city: string;
  state: string;
  postalCode?: string;
  countryCode: "IN";
  coordinates?: Coordinates;
}

export interface TravelPolicy {
  baseLocation: Address;
  radiusKm: number;
  nationwide: boolean;
  travelFee?: Money;
}

export type MediaSource = string | StaticImageData;
export type MediaKind = "image" | "video" | "audio";
export type GalleryCategory =
  "professional" | "stage" | "wedding" | "concert" | "traditional";
export type VideoProvider =
  "youtube" | "instagram-reel" | "local-mp4" | "vimeo" | "uploaded" | "external";

export interface MediaAsset {
  id: EntityId;
  kind: MediaKind;
  source: MediaSource;
  title: string;
  alt?: string;
  thumbnail?: MediaSource;
  provider?: VideoProvider;
  durationSeconds?: number;
  galleryCategory?: GalleryCategory;
}

export type SocialPlatform =
  "instagram" | "spotify" | "youtube" | "facebook" | "x" | "website";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface AudioSample {
  id: EntityId;
  title: string;
  url: string;
  durationSeconds?: number;
  provider: "spotify" | "soundcloud" | "uploaded" | "external";
}

export interface TimeRange {
  start: string;
  end: string;
}

export type Weekday =
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface WeeklyAvailability {
  weekday: Weekday;
  ranges: readonly TimeRange[];
}

export interface AvailabilityCalendar {
  timezone: string;
  weekly: readonly WeeklyAvailability[];
  blockedDates: readonly ISODate[];
  availableDates?: readonly ISODate[];
  minimumLeadDays: number;
}

export type AvailabilityStatus =
  "available" | "booked" | "tentative" | "blocked" | "holiday" | "travel";

export interface PricingPackage {
  id: EntityId;
  name: string;
  description: string;
  price: Money;
  durationMinutes: number;
  inclusions: readonly string[];
  eventTypeIds?: readonly string[];
  negotiable: boolean;
  travelIncluded?: boolean;
  equipmentIncluded?: boolean;
  artistsIncluded?: number;
}

export interface EquipmentItem {
  id: EntityId;
  name: string;
  brand?: string;
  category: "instrument" | "sound" | "lighting" | "stage" | "other";
  quantity: number;
  providedByPerformer: boolean;
}

export type TrustBadgeKind =
  | "verified-artist"
  | "government-id-verified"
  | "professional-badge"
  | "top-rated"
  | "trending"
  | "featured"
  | "emergency-replacement"
  | "trusted-venue";

export type CancellationPolicyId = "standard" | "flexible" | "strict";

export interface TrustSignals {
  badges: readonly TrustBadgeKind[];
  cancellationPolicyId: CancellationPolicyId;
}

export interface RatingSummary {
  average: number;
  count: number;
  breakdown?: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
}

export interface Review {
  id: EntityId;
  bookingId: EntityId;
  performerId: EntityId;
  reviewerId: EntityId;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  comment: string;
  createdAt: ISODateTime;
  verifiedBooking: boolean;
  kind?: ReviewKind;
  mediaUrl?: string;
  mediaKind?: "photo" | "video";
  response?: {
    comment: string;
    createdAt: ISODateTime;
  };
}

export interface Certificate {
  id: EntityId;
  name: string;
  issuer: string;
  issuedOn?: ISODate;
  expiresOn?: ISODate;
  verificationUrl?: string;
}

export interface Award {
  id: EntityId;
  name: string;
  issuer: string;
  awardedOn?: ISODate;
  description?: string;
  kind?: AwardKind;
}

export interface FAQ {
  id: EntityId;
  question: string;
  answer: string;
}

export type PerformerKind = "solo" | "band" | "traditional-group" | "dj" | "ensemble";

export interface PerformerProfile {
  id: EntityId;
  handle: string;
  kind: PerformerKind;
  displayName: string;
  headline: string;
  biography: string;
  coverImage: MediaAsset;
  profilePhoto: MediaAsset;
  categoryIds: readonly string[];
  subcategoryIds: readonly string[];
  skillIds: readonly string[];
  instrumentIds: readonly string[];
  genreIds: readonly string[];
  languageIds: readonly string[];
  typicalPerformanceDurationMinutes: number;
  supportedEventTypeIds: readonly string[];
  mediaGallery: readonly MediaAsset[];
  videos: readonly MediaAsset[];
  socialLinks: readonly SocialLink[];
  audioSamples: readonly AudioSample[];
  portfolioMedia: readonly PortfolioMediaItem[];
  performanceHistory: readonly PerformanceHistoryItem[];
  socialProof: SocialProofMetrics;
  verification: PerformerVerification;
  experience: {
    years: number;
    completedEvents?: number;
    highlights: readonly string[];
  };
  pricingPackages: readonly PricingPackage[];
  availability: AvailabilityCalendar;
  equipment: readonly EquipmentItem[];
  travel: TravelPolicy;
  rating: RatingSummary;
  awards: readonly Award[];
  certificates: readonly Certificate[];
  faqs: readonly FAQ[];
  memberCount?: number;
  verified: boolean;
  trustSignals: TrustSignals;
  responseTimeMinutes?: number;
  profileViews?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type VenueType =
  | "hotel"
  | "cafe"
  | "restaurant"
  | "resort"
  | "wedding-hall"
  | "wedding-venue"
  | "banquet-hall"
  | "club"
  | "lounge"
  | "corporate-venue"
  | "corporate-office"
  | "college-venue"
  | "college";

export interface RecurringSchedule {
  id: EntityId;
  title: string;
  weekdays: readonly Weekday[];
  time: TimeRange;
  preferredPerformerCategoryIds: readonly string[];
  preferredGenreIds: readonly string[];
  activeFrom?: ISODate;
  activeUntil?: ISODate;
}

export interface VenueProfile {
  id: EntityId;
  handle: string;
  name: string;
  type: VenueType;
  description: string;
  location: Address;
  capacity: {
    seated?: number;
    standing?: number;
  };
  amenityIds: readonly string[];
  preferredGenreIds: readonly string[];
  preferredEventTypeIds: readonly string[];
  mediaGallery: readonly MediaAsset[];
  recurringSchedules: readonly RecurringSchedule[];
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  verified: boolean;
  trustSignals: TrustSignals;
}

export interface OrganizerAnalytics {
  upcomingEvents: number;
  budgetUsed: Money;
  budgetAllocated: Money;
  budgetUsedPercent: number;
  pendingArtists: number;
  confirmedArtists: number;
  timelineProgressPercent: number;
}

export interface PerformerAnalytics {
  bookings: number;
  revenue: Money;
  rating: number;
  ratingCount: number;
  profileViews: number;
  responseTimeMinutes: number;
  completionRatePercent: number;
}

export type EventFieldType =
  "text" | "textarea" | "number" | "boolean" | "single-select" | "multi-select";

export interface EventFieldDefinition {
  id: string;
  label: string;
  type: EventFieldType;
  required: boolean;
  options?: readonly string[];
  minimum?: number;
  maximum?: number;
}

export interface EventTypeDefinition {
  id: string;
  label: string;
  description: string;
  performerCategoryIds: readonly string[];
  suggestedGenreIds: readonly string[];
  fields: readonly EventFieldDefinition[];
}

export type EventTimelineItemKind =
  | "setup"
  | "sound-check"
  | "artist-arrival"
  | "performance"
  | "break"
  | "closing"
  | "custom";

export type EventTimelineItemStatus = "pending" | "active" | "completed" | "delayed";

export interface MarketplaceEventTimelineItem {
  id: EntityId;
  label: string;
  kind: EventTimelineItemKind;
  startTime: string;
  endTime?: string;
  status: EventTimelineItemStatus;
  notes?: string;
}

export type MarketplaceEventStatus =
  "draft" | "published" | "closed" | "cancelled" | "archived";

export interface MarketplaceEvent {
  id: EntityId;
  hostId: EntityId;
  venueId?: EntityId;
  eventTypeId: string;
  title: string;
  description?: string;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  location: Address;
  audienceSize?: number;
  budget: {
    minimum?: Money;
    maximum: Money;
  };
  dressCode?: string;
  theme?: string;
  languageIds: readonly string[];
  preferredGenreIds: readonly string[];
  preferredInstrumentIds: readonly string[];
  specialRequirements?: string;
  timeline: readonly MarketplaceEventTimelineItem[];
  customFieldValues: Readonly<
    Record<string, string | number | boolean | readonly string[]>
  >;
  status: MarketplaceEventStatus;
}

/** Input shape for organizer event create and update flows. */
export interface MarketplaceEventInput {
  title: string;
  eventTypeId: string;
  eventDate: ISODate;
  startTime: string;
  endTime: string;
  venueId?: EntityId;
  city: string;
  budgetMinimum?: number;
  budgetMaximum: number;
  audienceSize?: number;
  dressCode?: string;
  theme?: string;
  languageIds: readonly string[];
  preferredGenreIds: readonly string[];
  specialRequirements?: string;
  timeline: readonly MarketplaceEventTimelineItem[];
  status: MarketplaceEventStatus;
  description?: string;
}

export type ApplicationStatus =
  | "submitted"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled"
  | "withdrawn";

export interface Application {
  id: EntityId;
  eventId: EntityId;
  performerId: EntityId;
  proposedPackageId?: EntityId;
  quotedPrice: Money;
  message: string;
  status: ApplicationStatus;
  submittedAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "advance-pending"
  | "advance-paid"
  | "completed"
  | "reviewed"
  | "cancelled"
  | "declined";

export interface Booking {
  id: EntityId;
  eventId: EntityId;
  performerId: EntityId;
  hostId: EntityId;
  applicationId?: EntityId;
  packageId?: EntityId;
  agreedPrice: Money;
  status: BookingStatus;
  requestedAt: ISODateTime;
  updatedAt: ISODateTime;
  cancellationReason?: string;
}

/** Resolved application data used by performer-facing application surfaces. */
export interface PerformerApplicationContext {
  application: Application;
  event: MarketplaceEvent;
  venue?: VenueProfile;
  booking?: Booking;
}

/** Stable no-auth identity used by organizer dashboard routes. */
export interface OrganizerPersona {
  id: EntityId;
  displayName: string;
  hostId: EntityId;
  venueId: EntityId;
}

/** Fully resolved application data for organizer-facing triage surfaces. */
export interface OrganizerApplicationContext {
  application: Application;
  event: MarketplaceEvent;
  performer: PerformerProfile;
  booking?: Booking;
}

/** Fully resolved booking data for organizer-facing booking surfaces. */
export interface OrganizerBookingContext {
  booking: Booking;
  event: MarketplaceEvent;
  performer: PerformerProfile;
}

export interface OrganizerDashboardData {
  persona: OrganizerPersona;
  venue: VenueProfile;
  events: readonly MarketplaceEvent[];
  applications: readonly OrganizerApplicationContext[];
  bookings: readonly OrganizerBookingContext[];
}

export type PaymentStatus =
  "not-started" | "pending" | "authorized" | "paid" | "failed" | "refunded";

export interface PaymentPlaceholder {
  id: EntityId;
  bookingId: EntityId;
  kind: "advance" | "balance" | "refund";
  amount: Money;
  status: PaymentStatus;
  providerReference?: string;
  dueAt?: ISODateTime;
  paidAt?: ISODateTime;
}

export interface ChatParticipant {
  userId: EntityId;
  role: "host" | "performer" | "venue-manager" | "support";
}

export interface ChatMessage {
  id: EntityId;
  threadId: EntityId;
  senderId: EntityId;
  body: string;
  sentAt: ISODateTime;
  readBy: readonly EntityId[];
}

export interface ChatThread {
  id: EntityId;
  bookingId?: EntityId;
  applicationId?: EntityId;
  participants: readonly ChatParticipant[];
  messages: readonly ChatMessage[];
  updatedAt: ISODateTime;
}

export interface CalendarEntry {
  id: EntityId;
  ownerType: "performer" | "venue" | "host";
  ownerId: EntityId;
  title: string;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  status: AvailabilityStatus;
  relatedBookingId?: EntityId;
}

export interface BookingRequestInput {
  performerId: EntityId;
  eventTypeId: string;
  eventDate: ISODate;
  startTime: string;
  endTime: string;
  venueId: EntityId;
  venueName: string;
  city: string;
  audienceSize: number;
  packageId?: EntityId;
  budget: Money;
  specialRequirements: string;
}

export interface EventContext {
  eventTypeId: string;
  budget: number;
  guests: number;
  city: string;
  languageIds?: readonly string[];
  genreIds?: readonly string[];
  eventDate?: ISODate;
}

export interface CompatibilityBreakdown {
  availabilityScore: number;
  budgetMatch: number;
  distanceMatch: number;
  genreMatch: number;
  languageMatch: number;
  experienceMatch: number;
  overallMatch: number;
}

export interface RecommendationInput {
  eventTypeId: string;
  budget: number;
  guests: number;
  city: string;
  languageIds: readonly string[];
  genreIds: readonly string[];
  eventDate?: ISODate;
}

export interface RecommendedPerformerResult {
  performer: PerformerProfile;
  compatibilityScore: number;
  breakdown: CompatibilityBreakdown;
  reasons: readonly string[];
}

export interface RecommendationResult {
  performers: readonly RecommendedPerformerResult[];
  traditionalGroups: readonly RecommendedPerformerResult[];
  bands: readonly RecommendedPerformerResult[];
  suggestedInstrumentIds: readonly string[];
  estimatedBudget: Money;
  reasons: readonly string[];
  compatibilityScore: number;
}

export type CulturalSoundDimension =
  "region" | "state" | "festival" | "instrument" | "occasion" | "mood" | "tradition";

export interface CulturalSoundMatchCriteria {
  genreIds?: readonly string[];
  instrumentIds?: readonly string[];
  languageIds?: readonly string[];
  categoryIds?: readonly string[];
  states?: readonly string[];
  eventTypeIds?: readonly string[];
  kind?: PerformerKind;
}

export interface CulturalSoundVideo {
  title: string;
  url: string;
}

export interface CulturalSoundCategory {
  slug: string;
  label: string;
  dimension: CulturalSoundDimension;
  tagline: string;
  description: string;
  history: string;
  videos: readonly CulturalSoundVideo[];
  featuredArtistIds: readonly EntityId[];
  matchCriteria?: CulturalSoundMatchCriteria;
}

export interface ExperienceTimelineItem {
  time: string;
  title: string;
  description: string;
  performerIds?: readonly EntityId[];
}

export interface ExperiencePackage {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  artistIds: readonly EntityId[];
  timeline: readonly ExperienceTimelineItem[];
  equipment: readonly string[];
  suggestedBudget: Money;
  recommendedVenueId: EntityId;
  durationMinutes: number;
  eventTypeId: string;
  genreIds: readonly string[];
}
