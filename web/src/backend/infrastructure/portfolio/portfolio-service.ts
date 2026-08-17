import { randomBytes } from "node:crypto";

import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import type { MediaSecurityService } from "@/backend/application/ports/services";
import {
  analyticsRates,
  AvailabilityDayStatus,
  computeDiscoveryBoost,
  computePortfolioCompleteness,
  isPortfolioMediaType,
  isSetlistEventType,
  PortfolioMediaType,
  validatePortfolioMediaUrl,
  VerificationStatus,
  type AvailabilityDay,
  type AvailabilityDayStatus as DayStatus,
  type DiscoveryScoreBreakdown,
  type MediaAnalyticsSnapshot,
  type MonthlyAvailability,
  type PerformerSetlist,
  type PortfolioMediaItem,
  type PortfolioMediaType as MediaType,
  type SetlistEventType,
  type VerifiedPerformance,
  type VerificationStatus as VerifStatus,
} from "@/backend/domain/portfolio";
import type { LifecycleService } from "@/backend/infrastructure/lifecycle/lifecycle-service";
import { notFoundError, validationError } from "@/backend/shared/errors";

function id(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export interface PortfolioShowcase {
  readonly performerId: string;
  readonly hero?: PortfolioMediaItem;
  readonly featuredVideo?: PortfolioMediaItem;
  readonly gallery: readonly PortfolioMediaItem[];
  readonly topPerformances: readonly PortfolioMediaItem[];
  readonly media: readonly PortfolioMediaItem[];
  readonly setlists: readonly PerformerSetlist[];
  readonly verifiedPerformances: readonly VerifiedPerformance[];
  readonly genres: readonly string[];
  readonly languages: readonly string[];
  readonly instruments: readonly string[];
  readonly reviews: readonly unknown[];
  readonly analytics: MediaAnalyticsSnapshot;
  readonly discovery: DiscoveryScoreBreakdown;
  readonly bookingCta: { readonly href: string; readonly label: string };
}

export interface PortfolioAnalyticsWidgets {
  readonly performerId: string;
  readonly widgets: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly format: "count" | "percent";
  }[];
}

export interface PortfolioService {
  listMedia(performerId: string): Promise<readonly PortfolioMediaItem[]>;
  getMedia(mediaId: string): Promise<PortfolioMediaItem | undefined>;
  createMedia(input: {
    performerId: string;
    title: string;
    description?: string;
    mediaType: string;
    thumbnail?: string;
    url: string;
    duration?: number;
    featured?: boolean;
    hero?: boolean;
    mimeType?: string;
    sizeBytes?: number;
    originalName?: string;
  }): Promise<PortfolioMediaItem>;
  updateMedia(
    mediaId: string,
    patch: Partial<{
      title: string;
      description: string;
      thumbnail: string;
      url: string;
      duration: number;
      featured: boolean;
      hero: boolean;
    }>,
  ): Promise<PortfolioMediaItem>;
  deleteMedia(mediaId: string): Promise<void>;
  listSetlists(performerId: string): Promise<readonly PerformerSetlist[]>;
  createSetlist(input: {
    performerId: string;
    title: string;
    songs: readonly string[];
    duration: number;
    eventType: string;
  }): Promise<PerformerSetlist>;
  updateSetlist(
    setlistId: string,
    patch: Partial<{
      title: string;
      songs: readonly string[];
      duration: number;
      eventType: string;
    }>,
  ): Promise<PerformerSetlist>;
  deleteSetlist(setlistId: string): Promise<void>;
  listVerified(performerId: string): Promise<readonly VerifiedPerformance[]>;
  requestVerification(input: {
    eventId: string;
    organizerId: string;
    performerId: string;
  }): Promise<VerifiedPerformance>;
  reviewVerification(input: {
    id: string;
    status: VerifStatus;
  }): Promise<VerifiedPerformance>;
  upsertAvailabilityDay(input: {
    performerId: string;
    date: string;
    status: DayStatus;
    note?: string;
    relatedLifecycleId?: string;
  }): Promise<AvailabilityDay>;
  getMonth(input: {
    performerId: string;
    year: number;
    month: number;
  }): Promise<MonthlyAvailability>;
  syncAvailabilityFromLifecycle(performerId: string): Promise<MonthlyAvailability>;
  trackEvent(input: {
    performerId: string;
    event:
      | "video_view"
      | "portfolio_view"
      | "profile_view"
      | "click"
      | "booking_start"
      | "booking_conversion";
    mediaId?: string;
  }): Promise<MediaAnalyticsSnapshot>;
  getAnalytics(performerId: string): Promise<MediaAnalyticsSnapshot>;
  getAnalyticsWidgets(performerId: string): Promise<PortfolioAnalyticsWidgets>;
  getShowcase(performerId: string): Promise<PortfolioShowcase>;
  getDiscoveryScore(performerId: string): Promise<DiscoveryScoreBreakdown>;
  rankPerformers(
    performerIds: readonly string[],
  ): Promise<readonly { performerId: string; score: DiscoveryScoreBreakdown }[]>;
  portfolioCompleteness(performerId: string): Promise<number>;
}

type Counters = {
  videoViews: number;
  portfolioViews: number;
  profileViews: number;
  clicks: number;
  bookingStarts: number;
  bookingConversions: number;
};

const emptyCounters = (): Counters => ({
  videoViews: 0,
  portfolioViews: 0,
  profileViews: 0,
  clicks: 0,
  bookingStarts: 0,
  bookingConversions: 0,
});

export function createPortfolioService(options: {
  repositories: PlatformRepositories;
  lifecycle?: LifecycleService;
  mediaSecurity?: MediaSecurityService;
}): PortfolioService {
  const mediaById = new Map<string, PortfolioMediaItem>();
  const setlistsById = new Map<string, PerformerSetlist>();
  const verifiedById = new Map<string, VerifiedPerformance>();
  const availability = new Map<string, AvailabilityDay>();
  const analyticsByPerformer = new Map<string, Counters>();

  function availabilityKey(performerId: string, date: string): string {
    return `${performerId}:${date}`;
  }

  function mediaFor(performerId: string): PortfolioMediaItem[] {
    return [...mediaById.values()].filter((m) => m.performerId === performerId);
  }

  function setlistsFor(performerId: string): PerformerSetlist[] {
    return [...setlistsById.values()].filter((s) => s.performerId === performerId);
  }

  function verifiedFor(performerId: string): VerifiedPerformance[] {
    return [...verifiedById.values()].filter((v) => v.performerId === performerId);
  }

  function snapshot(performerId: string): MediaAnalyticsSnapshot {
    const counters = analyticsByPerformer.get(performerId) ?? emptyCounters();
    const rates = analyticsRates(counters);
    return { performerId, ...counters, ...rates };
  }

  async function completeness(performerId: string): Promise<number> {
    const items = mediaFor(performerId);
    return computePortfolioCompleteness({
      mediaCount: items.length,
      hasHero: items.some((m) => m.hero),
      hasFeaturedVideo: items.some(
        (m) =>
          m.featured &&
          (m.mediaType === "performance_video" || m.mediaType === "youtube"),
      ),
      setlistCount: setlistsFor(performerId).length,
      hasAvailability: [...availability.keys()].some((k) =>
        k.startsWith(`${performerId}:`),
      ),
      socialLinkTypes: items.map((m) => m.mediaType),
    });
  }

  async function discoveryFor(performerId: string): Promise<DiscoveryScoreBreakdown> {
    const performer = await options.repositories.performers.getById(performerId);
    const bookings = await options.repositories.bookings.listByPerformer(performerId);
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const denom = completed + cancelled;
    const bookingSuccessRate = denom === 0 ? 0.5 : completed / denom;
    const verifiedCount = verifiedFor(performerId).filter(
      (v) => v.verificationStatus === VerificationStatus.VERIFIED,
    ).length;

    return computeDiscoveryBoost({
      ratingAverage: performer?.rating.average ?? 0,
      ratingCount: performer?.rating.count ?? 0,
      verifiedPerformanceCount: verifiedCount,
      portfolioCompleteness: await completeness(performerId),
      responseTimeMinutes: performer?.responseTimeMinutes ?? 240,
      bookingSuccessRate,
    });
  }

  const service: PortfolioService = {
    async listMedia(performerId) {
      return mediaFor(performerId).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    },

    async getMedia(mediaId) {
      return mediaById.get(mediaId);
    },

    async createMedia(input) {
      if (!isPortfolioMediaType(input.mediaType)) {
        throw validationError("Unsupported mediaType.");
      }
      if (!input.title?.trim()) {
        throw validationError("title is required.");
      }
      const urlCheck = validatePortfolioMediaUrl(
        input.mediaType as MediaType,
        input.url,
      );
      if (!urlCheck.ok) {
        throw validationError(urlCheck.reason);
      }

      if (
        options.mediaSecurity &&
        input.mimeType &&
        typeof input.sizeBytes === "number"
      ) {
        const scan = options.mediaSecurity.validateUpload({
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          originalName: input.originalName ?? "upload.bin",
        });
        if (!scan.accepted) {
          throw validationError(scan.reason ?? "Media rejected by security scan.");
        }
      }

      if (input.hero) {
        for (const item of mediaFor(input.performerId)) {
          if (item.hero) {
            mediaById.set(item.id, { ...item, hero: false });
          }
        }
      }

      const item: PortfolioMediaItem = {
        id: id("pmedia"),
        performerId: input.performerId,
        title: input.title.trim(),
        description: (input.description ?? "").trim(),
        mediaType: input.mediaType as MediaType,
        thumbnail: input.thumbnail,
        url: input.url,
        duration: input.duration,
        createdAt: isoNow(),
        featured: Boolean(input.featured),
        hero: Boolean(input.hero),
      };
      mediaById.set(item.id, item);
      return item;
    },

    async updateMedia(mediaId, patch) {
      const existing = mediaById.get(mediaId);
      if (!existing) throw notFoundError("Media item", mediaId);
      if (patch.url) {
        const urlCheck = validatePortfolioMediaUrl(existing.mediaType, patch.url);
        if (!urlCheck.ok) throw validationError(urlCheck.reason);
      }
      if (patch.hero) {
        for (const item of mediaFor(existing.performerId)) {
          if (item.id !== mediaId && item.hero) {
            mediaById.set(item.id, { ...item, hero: false });
          }
        }
      }
      const updated: PortfolioMediaItem = {
        ...existing,
        title: patch.title?.trim() ?? existing.title,
        description: patch.description?.trim() ?? existing.description,
        thumbnail: patch.thumbnail ?? existing.thumbnail,
        url: patch.url ?? existing.url,
        duration: patch.duration ?? existing.duration,
        featured: patch.featured ?? existing.featured,
        hero: patch.hero ?? existing.hero,
      };
      mediaById.set(mediaId, updated);
      return updated;
    },

    async deleteMedia(mediaId) {
      if (!mediaById.delete(mediaId)) {
        throw notFoundError("Media item", mediaId);
      }
    },

    async listSetlists(performerId) {
      return setlistsFor(performerId).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );
    },

    async createSetlist(input) {
      if (!isSetlistEventType(input.eventType)) {
        throw validationError("Unsupported setlist eventType.");
      }
      if (!input.title?.trim()) throw validationError("title is required.");
      if (!input.songs?.length) throw validationError("songs must be non-empty.");
      if (!Number.isFinite(input.duration) || input.duration <= 0) {
        throw validationError("duration must be a positive number (minutes).");
      }
      const now = isoNow();
      const setlist: PerformerSetlist = {
        id: id("setlist"),
        performerId: input.performerId,
        title: input.title.trim(),
        songs: input.songs.map((s) => s.trim()).filter(Boolean),
        duration: input.duration,
        eventType: input.eventType as SetlistEventType,
        createdAt: now,
        updatedAt: now,
      };
      setlistsById.set(setlist.id, setlist);
      return setlist;
    },

    async updateSetlist(setlistId, patch) {
      const existing = setlistsById.get(setlistId);
      if (!existing) throw notFoundError("Setlist", setlistId);
      if (patch.eventType && !isSetlistEventType(patch.eventType)) {
        throw validationError("Unsupported setlist eventType.");
      }
      const updated: PerformerSetlist = {
        ...existing,
        title: patch.title?.trim() ?? existing.title,
        songs: patch.songs
          ? patch.songs.map((s) => s.trim()).filter(Boolean)
          : existing.songs,
        duration: patch.duration ?? existing.duration,
        eventType: (patch.eventType as SetlistEventType) ?? existing.eventType,
        updatedAt: isoNow(),
      };
      if (!updated.songs.length) throw validationError("songs must be non-empty.");
      setlistsById.set(setlistId, updated);
      return updated;
    },

    async deleteSetlist(setlistId) {
      if (!setlistsById.delete(setlistId)) {
        throw notFoundError("Setlist", setlistId);
      }
    },

    async listVerified(performerId) {
      return verifiedFor(performerId);
    },

    async requestVerification(input) {
      const existing = verifiedFor(input.performerId).find(
        (v) => v.eventId === input.eventId,
      );
      if (existing) return existing;
      const record: VerifiedPerformance = {
        id: id("vperf"),
        eventId: input.eventId,
        organizerId: input.organizerId,
        performerId: input.performerId,
        verificationStatus: VerificationStatus.PENDING,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      };
      verifiedById.set(record.id, record);
      return record;
    },

    async reviewVerification(input) {
      const existing = verifiedById.get(input.id);
      if (!existing) throw notFoundError("Verified performance", input.id);
      if (
        input.status !== VerificationStatus.VERIFIED &&
        input.status !== VerificationStatus.REJECTED &&
        input.status !== VerificationStatus.PENDING
      ) {
        throw validationError("Invalid verificationStatus.");
      }
      const updated: VerifiedPerformance = {
        ...existing,
        verificationStatus: input.status,
        updatedAt: isoNow(),
      };
      verifiedById.set(input.id, updated);
      return updated;
    },

    async upsertAvailabilityDay(input) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
        throw validationError("date must be YYYY-MM-DD.");
      }
      const allowed = Object.values(AvailabilityDayStatus) as DayStatus[];
      if (!allowed.includes(input.status)) {
        throw validationError("Unsupported availability status.");
      }
      const day: AvailabilityDay = {
        date: input.date,
        status: input.status,
        note: input.note,
        relatedLifecycleId: input.relatedLifecycleId,
      };
      availability.set(availabilityKey(input.performerId, input.date), day);
      return day;
    },

    async getMonth(input) {
      const { performerId, year, month } = input;
      if (month < 1 || month > 12) throw validationError("month must be 1–12.");
      const total = daysInMonth(year, month);
      const days: AvailabilityDay[] = [];
      for (let day = 1; day <= total; day += 1) {
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const stored = availability.get(availabilityKey(performerId, date));
        days.push(
          stored ?? {
            date,
            status: AvailabilityDayStatus.AVAILABLE,
          },
        );
      }
      return { performerId, year, month, days };
    },

    async syncAvailabilityFromLifecycle(performerId) {
      if (!options.lifecycle) {
        throw validationError("Lifecycle service unavailable for sync.");
      }
      const lifecycles = await options.lifecycle.list({ performerId });
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth() + 1;

      for (const lc of lifecycles) {
        const event = await options.repositories.events.getById(lc.eventId);
        if (!event?.startsAt) continue;
        const date = event.startsAt.slice(0, 10);
        let status: DayStatus | undefined;
        if (
          lc.status === "confirmed" ||
          lc.status === "advance_paid" ||
          lc.status === "contract_signed" ||
          lc.status === "upcoming" ||
          lc.status === "completed"
        ) {
          status = AvailabilityDayStatus.BOOKED;
        } else if (
          lc.status === "shortlisted" ||
          lc.status === "negotiating" ||
          lc.status === "applied" ||
          lc.status === "invited"
        ) {
          status = AvailabilityDayStatus.TENTATIVE;
        }
        if (!status) continue;
        const key = availabilityKey(performerId, date);
        const existing = availability.get(key);
        const rank = (s: DayStatus) =>
          s === "booked" ? 3 : s === "blocked" ? 2 : s === "tentative" ? 1 : 0;
        if (!existing || rank(status) >= rank(existing.status)) {
          availability.set(key, {
            date,
            status,
            relatedLifecycleId: lc.id,
          });
        }
      }

      return service.getMonth({ performerId, year, month });
    },

    async trackEvent(input) {
      const counters = analyticsByPerformer.get(input.performerId) ?? emptyCounters();
      switch (input.event) {
        case "video_view":
          counters.videoViews += 1;
          break;
        case "portfolio_view":
          counters.portfolioViews += 1;
          break;
        case "profile_view":
          counters.profileViews += 1;
          break;
        case "click":
          counters.clicks += 1;
          break;
        case "booking_start":
          counters.bookingStarts += 1;
          break;
        case "booking_conversion":
          counters.bookingConversions += 1;
          break;
        default:
          throw validationError("Unsupported analytics event.");
      }
      analyticsByPerformer.set(input.performerId, counters);
      return snapshot(input.performerId);
    },

    async getAnalytics(performerId) {
      return snapshot(performerId);
    },

    async getAnalyticsWidgets(performerId) {
      const a = snapshot(performerId);
      return {
        performerId,
        widgets: [
          { id: "video_views", label: "Video views", value: a.videoViews, format: "count" },
          {
            id: "portfolio_views",
            label: "Portfolio views",
            value: a.portfolioViews,
            format: "count",
          },
          {
            id: "profile_views",
            label: "Profile views",
            value: a.profileViews,
            format: "count",
          },
          { id: "ctr", label: "CTR", value: a.ctr, format: "percent" },
          {
            id: "booking_conversion",
            label: "Booking conversion",
            value: a.bookingConversionRate,
            format: "percent",
          },
        ],
      };
    },

    async getShowcase(performerId) {
      const performer = await options.repositories.performers.getById(performerId);
      if (!performer) throw notFoundError("Performer", performerId);
      const items = mediaFor(performerId);
      const hero = items.find((m) => m.hero) ?? items[0];
      const featuredVideo =
        items.find(
          (m) =>
            m.featured &&
            (m.mediaType === PortfolioMediaType.PERFORMANCE_VIDEO ||
              m.mediaType === PortfolioMediaType.YOUTUBE),
        ) ??
        items.find(
          (m) =>
            m.mediaType === PortfolioMediaType.PERFORMANCE_VIDEO ||
            m.mediaType === PortfolioMediaType.YOUTUBE,
        );
      const gallery = items.filter((m) => m.mediaType === PortfolioMediaType.PHOTO);
      const topPerformances = items
        .filter(
          (m) =>
            m.mediaType === PortfolioMediaType.PERFORMANCE_VIDEO ||
            m.mediaType === PortfolioMediaType.YOUTUBE ||
            m.mediaType === PortfolioMediaType.INSTAGRAM_REEL,
        )
        .slice(0, 6);
      const reviews = await options.repositories.reviews.listByPerformer(performerId);

      return {
        performerId,
        hero,
        featuredVideo,
        gallery,
        topPerformances,
        media: items,
        setlists: setlistsFor(performerId),
        verifiedPerformances: verifiedFor(performerId),
        genres: performer.genreIds,
        languages: performer.languageIds,
        instruments: performer.instrumentIds,
        reviews,
        analytics: snapshot(performerId),
        discovery: await discoveryFor(performerId),
        bookingCta: {
          href: `/bookings/new?performer=${performerId}`,
          label: "Request booking",
        },
      };
    },

    async getDiscoveryScore(performerId) {
      return discoveryFor(performerId);
    },

    async rankPerformers(performerIds) {
      const ranked = await Promise.all(
        performerIds.map(async (performerId) => ({
          performerId,
          score: await discoveryFor(performerId),
        })),
      );
      return ranked.sort((a, b) => b.score.total - a.score.total);
    },

    async portfolioCompleteness(performerId) {
      return completeness(performerId);
    },
  };

  return service;
}

/** Exported for unit tests without container. */
export const __portfolioTestUtils = {
  AvailabilityDayStatus,
  PortfolioMediaType,
};
