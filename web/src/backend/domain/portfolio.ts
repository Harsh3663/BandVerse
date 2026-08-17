/**
 * Performer portfolio domain — media, setlists, availability, verification, discovery.
 * Extends marketplace without changing booking lifecycle or UI architecture.
 */

export const PortfolioMediaType = {
  PERFORMANCE_VIDEO: "performance_video",
  AUDIO_SAMPLE: "audio_sample",
  PHOTO: "photo",
  YOUTUBE: "youtube",
  INSTAGRAM_REEL: "instagram_reel",
  SPOTIFY: "spotify",
  WEBSITE: "website",
} as const;

export type PortfolioMediaType =
  (typeof PortfolioMediaType)[keyof typeof PortfolioMediaType];

export const SETLIST_EVENT_TYPES = [
  "wedding",
  "corporate",
  "sufi_night",
  "bollywood_night",
  "classical",
  "garba",
  "dj",
] as const;

export type SetlistEventType = (typeof SETLIST_EVENT_TYPES)[number];

export const AvailabilityDayStatus = {
  AVAILABLE: "available",
  TENTATIVE: "tentative",
  BOOKED: "booked",
  BLOCKED: "blocked",
} as const;

export type AvailabilityDayStatus =
  (typeof AvailabilityDayStatus)[keyof typeof AvailabilityDayStatus];

export const VerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export interface PortfolioMediaItem {
  readonly id: string;
  readonly performerId: string;
  readonly title: string;
  readonly description: string;
  readonly mediaType: PortfolioMediaType;
  readonly thumbnail?: string;
  readonly url: string;
  readonly duration?: number;
  readonly createdAt: string;
  readonly featured?: boolean;
  readonly hero?: boolean;
}

export interface PerformerSetlist {
  readonly id: string;
  readonly performerId: string;
  readonly title: string;
  readonly songs: readonly string[];
  readonly duration: number;
  readonly eventType: SetlistEventType;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface VerifiedPerformance {
  readonly id: string;
  readonly eventId: string;
  readonly organizerId: string;
  readonly performerId: string;
  readonly verificationStatus: VerificationStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AvailabilityDay {
  readonly date: string;
  readonly status: AvailabilityDayStatus;
  readonly relatedLifecycleId?: string;
  readonly note?: string;
}

export interface MonthlyAvailability {
  readonly performerId: string;
  readonly year: number;
  readonly month: number;
  readonly days: readonly AvailabilityDay[];
}

export interface MediaAnalyticsCounters {
  readonly videoViews: number;
  readonly portfolioViews: number;
  readonly profileViews: number;
  readonly clicks: number;
  readonly bookingStarts: number;
  readonly bookingConversions: number;
}

export interface MediaAnalyticsSnapshot extends MediaAnalyticsCounters {
  readonly performerId: string;
  readonly ctr: number;
  readonly bookingConversionRate: number;
}

export interface DiscoverySignals {
  readonly ratingAverage: number;
  readonly ratingCount: number;
  readonly verifiedPerformanceCount: number;
  readonly portfolioCompleteness: number;
  readonly responseTimeMinutes: number;
  readonly bookingSuccessRate: number;
}

export interface DiscoveryScoreBreakdown {
  readonly rating: number;
  readonly verifiedPerformances: number;
  readonly portfolioCompleteness: number;
  readonly responseTime: number;
  readonly bookingSuccessRate: number;
  readonly total: number;
}

const LINK_HOSTS: Record<
  Extract<
    PortfolioMediaType,
    "youtube" | "instagram_reel" | "spotify" | "website"
  >,
  RegExp
> = {
  youtube: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i,
  instagram_reel: /(^|\.)instagram\.com$/i,
  spotify: /(^|\.)spotify\.com$/i,
  website: /./,
};

export function isPortfolioMediaType(value: string): value is PortfolioMediaType {
  return Object.values(PortfolioMediaType).includes(value as PortfolioMediaType);
}

export function isSetlistEventType(value: string): value is SetlistEventType {
  return (SETLIST_EVENT_TYPES as readonly string[]).includes(value);
}

export function validatePortfolioMediaUrl(
  mediaType: PortfolioMediaType,
  url: string,
): { ok: true } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "URL must be absolute." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "URL must use http or https." };
  }

  const host = parsed.hostname.toLowerCase();
  if (mediaType === "youtube" && !LINK_HOSTS.youtube.test(host)) {
    return { ok: false, reason: "YouTube links must use youtube.com or youtu.be." };
  }
  if (mediaType === "instagram_reel" && !LINK_HOSTS.instagram_reel.test(host)) {
    return { ok: false, reason: "Instagram Reel links must use instagram.com." };
  }
  if (mediaType === "spotify" && !LINK_HOSTS.spotify.test(host)) {
    return { ok: false, reason: "Spotify links must use spotify.com." };
  }
  if (
    (mediaType === "performance_video" ||
      mediaType === "audio_sample" ||
      mediaType === "photo" ||
      mediaType === "website") &&
    !parsed.hostname
  ) {
    return { ok: false, reason: "URL host is required." };
  }
  return { ok: true };
}

/** 0–1 score based on presence of core portfolio assets. */
export function computePortfolioCompleteness(input: {
  readonly mediaCount: number;
  readonly hasHero: boolean;
  readonly hasFeaturedVideo: boolean;
  readonly setlistCount: number;
  readonly hasAvailability: boolean;
  readonly socialLinkTypes: readonly PortfolioMediaType[];
}): number {
  let score = 0;
  if (input.mediaCount >= 1) score += 0.15;
  if (input.mediaCount >= 5) score += 0.1;
  if (input.hasHero) score += 0.15;
  if (input.hasFeaturedVideo) score += 0.15;
  if (input.setlistCount >= 1) score += 0.15;
  if (input.hasAvailability) score += 0.1;
  const linkTypes = new Set(input.socialLinkTypes);
  if (linkTypes.has("youtube") || linkTypes.has("instagram_reel")) score += 0.1;
  if (linkTypes.has("spotify") || linkTypes.has("website")) score += 0.1;
  return Math.min(1, Math.round(score * 100) / 100);
}

export function computeDiscoveryBoost(
  signals: DiscoverySignals,
): DiscoveryScoreBreakdown {
  const rating =
    Math.min(1, Math.max(0, signals.ratingAverage / 5)) *
    (signals.ratingCount > 0 ? 1 : 0.35) *
    30;
  const verified = Math.min(1, signals.verifiedPerformanceCount / 5) * 20;
  const completeness = Math.min(1, Math.max(0, signals.portfolioCompleteness)) * 20;
  const response =
    signals.responseTimeMinutes <= 0
      ? 0
      : Math.min(1, 120 / Math.max(signals.responseTimeMinutes, 1)) * 15;
  const bookingSuccess = Math.min(1, Math.max(0, signals.bookingSuccessRate)) * 15;
  const total =
    Math.round((rating + verified + completeness + response + bookingSuccess) * 100) /
    100;
  return {
    rating: Math.round(rating * 100) / 100,
    verifiedPerformances: Math.round(verified * 100) / 100,
    portfolioCompleteness: Math.round(completeness * 100) / 100,
    responseTime: Math.round(response * 100) / 100,
    bookingSuccessRate: Math.round(bookingSuccess * 100) / 100,
    total,
  };
}

export function analyticsRates(counters: MediaAnalyticsCounters): {
  ctr: number;
  bookingConversionRate: number;
} {
  const impressions = Math.max(counters.portfolioViews + counters.profileViews, 0);
  const ctr =
    impressions === 0 ? 0 : Math.round((counters.clicks / impressions) * 10_000) / 10_000;
  const bookingConversionRate =
    counters.bookingStarts === 0
      ? 0
      : Math.round(
          (counters.bookingConversions / counters.bookingStarts) * 10_000,
        ) / 10_000;
  return { ctr, bookingConversionRate };
}
