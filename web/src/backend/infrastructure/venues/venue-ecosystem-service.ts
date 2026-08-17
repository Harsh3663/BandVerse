import { randomBytes } from "node:crypto";

import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import type { LifecycleService } from "@/backend/infrastructure/lifecycle/lifecycle-service";
import type { MediaSecurityService } from "@/backend/application/ports/services";
import {
  expandRecurringGigs,
  filterEventsByDiscovery,
  rankNearbyOpportunities,
  amenityIdsFromFacilities,
  facilitiesFromAmenityIds,
  type EventDiscoveryFilters,
  type NearbyOpportunity,
  type RecurringGig,
  type RecurringGigOccurrence,
  type VenueAnalyticsSnapshot,
  type VenueDashboardMetrics,
  type VenueFacilities,
  type VenueGalleryItem,
  type VenueVerification,
} from "@/modules/venues";
import { notFoundError, validationError } from "@/backend/shared/errors";
import type { MarketplaceEvent, VenueProfile } from "@/modules/marketplace/types";

function id(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

export interface VenueEcosystemService {
  getFacilities(venueId: string): Promise<VenueFacilities>;
  upsertFacilities(venueId: string, facilities: VenueFacilities): Promise<VenueFacilities>;
  listGallery(venueId: string): Promise<readonly VenueGalleryItem[]>;
  addGalleryItem(input: {
    venueId: string;
    kind: "photo" | "video" | "virtual_tour";
    title: string;
    url: string;
    thumbnail?: string;
    mimeType?: string;
    sizeBytes?: number;
    originalName?: string;
  }): Promise<VenueGalleryItem>;
  removeGalleryItem(itemId: string): Promise<void>;
  getVerification(venueId: string): Promise<VenueVerification>;
  updateVerification(
    venueId: string,
    patch: Partial<Omit<VenueVerification, "venueId" | "updatedAt">>,
  ): Promise<VenueVerification>;
  listGigs(venueId: string): Promise<readonly RecurringGig[]>;
  createGig(input: {
    venueId: string;
    title: string;
    description?: string;
    weekdays: readonly string[];
    startTime: string;
    endTime: string;
    neededRoles: readonly string[];
    preferredGenreIds?: readonly string[];
    budgetPaise?: number;
    activeFrom?: string;
    activeUntil?: string;
  }): Promise<RecurringGig>;
  updateGig(
    gigId: string,
    patch: Partial<{
      title: string;
      description: string;
      weekdays: readonly string[];
      startTime: string;
      endTime: string;
      neededRoles: readonly string[];
      preferredGenreIds: readonly string[];
      budgetPaise: number;
      active: boolean;
      activeFrom: string;
      activeUntil: string;
    }>,
  ): Promise<RecurringGig>;
  expandGigs(input: {
    venueId?: string;
    fromDate: string;
    toDate: string;
  }): Promise<readonly RecurringGigOccurrence[]>;
  discoverEvents(filters: EventDiscoveryFilters): Promise<readonly MarketplaceEvent[]>;
  nearbyOpportunities(input: {
    city: string;
    limit?: number;
  }): Promise<readonly NearbyOpportunity[]>;
  getDashboardMetrics(venueId: string): Promise<VenueDashboardMetrics>;
  getAnalytics(venueId: string): Promise<VenueAnalyticsSnapshot>;
  enrichVenueProfile(venue: VenueProfile): Promise<
    VenueProfile & {
      facilities: VenueFacilities;
      verification: VenueVerification;
      gallery: readonly VenueGalleryItem[];
    }
  >;
  /** Application helpers that delegate to booking lifecycle (no lifecycle edits). */
  applyToEvent(input: {
    eventId: string;
    performerId: string;
    hostId: string;
    actorUserId: string;
    message: string;
    quotedPaise: number;
  }): Promise<unknown>;
  withdrawApplication(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<unknown>;
  shortlistApplication(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<unknown>;
  invitePerformer(input: {
    eventId: string;
    hostId: string;
    performerId: string;
    actorUserId: string;
  }): Promise<unknown>;
  rejectInvite(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<unknown>;
}

export function createVenueEcosystemService(options: {
  repositories: PlatformRepositories;
  lifecycle?: LifecycleService;
  mediaSecurity?: MediaSecurityService;
}): VenueEcosystemService {
  const facilitiesByVenue = new Map<string, VenueFacilities>();
  const galleryById = new Map<string, VenueGalleryItem>();
  const verificationByVenue = new Map<string, VenueVerification>();
  const gigsById = new Map<string, RecurringGig>();

  function defaultVerification(venueId: string): VenueVerification {
    return {
      venueId,
      gstVerified: false,
      businessVerified: false,
      phoneVerified: false,
      emailVerified: false,
      updatedAt: isoNow(),
    };
  }

  async function ensureVenue(venueId: string): Promise<VenueProfile> {
    const venue = await options.repositories.venues.getById(venueId);
    if (!venue) throw notFoundError("Venue", venueId);
    if (!facilitiesByVenue.has(venueId)) {
      facilitiesByVenue.set(venueId, facilitiesFromAmenityIds(venue.amenityIds));
    }
    if (!verificationByVenue.has(venueId)) {
      verificationByVenue.set(venueId, {
        ...defaultVerification(venueId),
        emailVerified: Boolean(venue.contact.email),
        phoneVerified: Boolean(venue.contact.phone),
        businessVerified: venue.verified,
      });
    }
    return venue;
  }

  const service: VenueEcosystemService = {
    async getFacilities(venueId) {
      await ensureVenue(venueId);
      return facilitiesByVenue.get(venueId)!;
    },

    async upsertFacilities(venueId, facilities) {
      await ensureVenue(venueId);
      facilitiesByVenue.set(venueId, facilities);
      return facilities;
    },

    async listGallery(venueId) {
      await ensureVenue(venueId);
      return [...galleryById.values()]
        .filter((item) => item.venueId === venueId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async addGalleryItem(input) {
      await ensureVenue(input.venueId);
      if (!input.title?.trim()) throw validationError("title is required.");
      try {
        void new URL(input.url);
      } catch {
        throw validationError("url must be absolute.");
      }
      if (input.kind !== "virtual_tour" && options.mediaSecurity) {
        if (!input.mimeType || typeof input.sizeBytes !== "number") {
          throw validationError("mimeType and sizeBytes required for media uploads.");
        }
        const scan = options.mediaSecurity.validateUpload({
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          originalName: input.originalName ?? "upload.bin",
        });
        if (!scan.accepted) {
          throw validationError(scan.reason ?? "Media rejected.");
        }
      }
      const item: VenueGalleryItem = {
        id: id("vgallery"),
        venueId: input.venueId,
        kind: input.kind,
        title: input.title.trim(),
        url: input.url,
        thumbnail: input.thumbnail,
        createdAt: isoNow(),
      };
      galleryById.set(item.id, item);
      return item;
    },

    async removeGalleryItem(itemId) {
      if (!galleryById.delete(itemId)) throw notFoundError("Gallery item", itemId);
    },

    async getVerification(venueId) {
      await ensureVenue(venueId);
      return verificationByVenue.get(venueId)!;
    },

    async updateVerification(venueId, patch) {
      await ensureVenue(venueId);
      const current = verificationByVenue.get(venueId)!;
      const updated: VenueVerification = {
        ...current,
        ...patch,
        venueId,
        updatedAt: isoNow(),
      };
      verificationByVenue.set(venueId, updated);
      return updated;
    },

    async listGigs(venueId) {
      await ensureVenue(venueId);
      return [...gigsById.values()]
        .filter((g) => g.venueId === venueId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async createGig(input) {
      await ensureVenue(input.venueId);
      if (!input.title?.trim()) throw validationError("title is required.");
      if (!input.weekdays?.length) throw validationError("weekdays required.");
      if (!/^\d{2}:\d{2}$/.test(input.startTime) || !/^\d{2}:\d{2}$/.test(input.endTime)) {
        throw validationError("startTime/endTime must be HH:MM.");
      }
      if (!input.neededRoles?.length) {
        throw validationError("neededRoles must be non-empty.");
      }
      const now = isoNow();
      const gig: RecurringGig = {
        id: id("rgig"),
        venueId: input.venueId,
        title: input.title.trim(),
        description: (input.description ?? "").trim(),
        weekdays: input.weekdays,
        startTime: input.startTime,
        endTime: input.endTime,
        neededRoles: input.neededRoles,
        preferredGenreIds: input.preferredGenreIds ?? [],
        budgetPaise: input.budgetPaise,
        active: true,
        activeFrom: input.activeFrom,
        activeUntil: input.activeUntil,
        createdAt: now,
        updatedAt: now,
      };
      gigsById.set(gig.id, gig);
      return gig;
    },

    async updateGig(gigId, patch) {
      const existing = gigsById.get(gigId);
      if (!existing) throw notFoundError("Recurring gig", gigId);
      const updated: RecurringGig = {
        ...existing,
        title: patch.title?.trim() ?? existing.title,
        description: patch.description?.trim() ?? existing.description,
        weekdays: patch.weekdays ?? existing.weekdays,
        startTime: patch.startTime ?? existing.startTime,
        endTime: patch.endTime ?? existing.endTime,
        neededRoles: patch.neededRoles ?? existing.neededRoles,
        preferredGenreIds: patch.preferredGenreIds ?? existing.preferredGenreIds,
        budgetPaise: patch.budgetPaise ?? existing.budgetPaise,
        active: patch.active ?? existing.active,
        activeFrom: patch.activeFrom ?? existing.activeFrom,
        activeUntil: patch.activeUntil ?? existing.activeUntil,
        updatedAt: isoNow(),
      };
      gigsById.set(gigId, updated);
      return updated;
    },

    async expandGigs(input) {
      const gigs = input.venueId
        ? await service.listGigs(input.venueId)
        : [...gigsById.values()];
      return expandRecurringGigs(gigs, input);
    },

    async discoverEvents(filters) {
      const all = await options.repositories.events.list();
      let filtered = filterEventsByDiscovery(all, {
        city: filters.city,
        budgetMin: filters.budgetMin,
        budgetMax: filters.budgetMax,
        category: filters.category,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
      if (filters.performerType) {
        const needle = filters.performerType.toLocaleLowerCase("en-IN");
        filtered = filtered.filter((event) =>
          (event.description ?? "").toLocaleLowerCase("en-IN").includes(needle) ||
          event.eventTypeId.toLocaleLowerCase("en-IN").includes(needle),
        );
      }
      return filtered.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    },

    async nearbyOpportunities(input) {
      const [events, venues] = await Promise.all([
        options.repositories.events.list(),
        options.repositories.venues.list(),
      ]);
      const cityEvents = events.filter(
        (e) =>
          e.location.city.toLocaleLowerCase("en-IN") ===
            input.city.toLocaleLowerCase("en-IN") ||
          e.status === "published",
      );
      const candidates = [
        ...cityEvents.map((event) => ({
          id: `event:${event.id}`,
          kind: "event" as const,
          title: event.title,
          city: event.location.city,
          date: event.startsAt.slice(0, 10),
          relevance: event.status === "published" ? 0.9 : 0.5,
          reviewScore: 0.7,
          responseRate: 0.75,
          completionRate: 0.8,
          venueId: event.venueId,
          eventId: event.id,
        })),
        ...[...gigsById.values()]
          .filter((g) => g.active)
          .map((gig) => {
            const venue = venues.find((v) => v.id === gig.venueId);
            return {
              id: `gig:${gig.id}`,
              kind: "recurring_gig" as const,
              title: gig.title,
              city: venue?.location.city ?? input.city,
              relevance: 0.85,
              reviewScore: venue?.verified ? 0.9 : 0.6,
              responseRate: 0.7,
              completionRate: 0.75,
              venueId: gig.venueId,
              gigId: gig.id,
            };
          }),
      ];
      return rankNearbyOpportunities(input.city, candidates, input.limit ?? 20);
    },

    async getDashboardMetrics(venueId) {
      await ensureVenue(venueId);
      const events = (await options.repositories.events.list()).filter(
        (e) => e.venueId === venueId,
      );
      const bookings = await options.repositories.bookings.list();
      const venueBookings = bookings.filter((b) =>
        events.some((e) => e.id === b.eventId),
      );
      const upcomingEvents = events.filter(
        (e) => e.status === "published" && e.startsAt >= isoNow(),
      ).length;
      const revenuePaise = venueBookings
        .filter((b) => b.status === "completed" || b.status === "confirmed")
        .reduce((sum, b) => sum + Math.round(b.agreedPrice.amount * 100), 0);
      const applications = await options.repositories.applications.list();
      const eventIds = new Set(events.map((e) => e.id));
      const relatedApps = applications.filter((a) => eventIds.has(a.eventId));
      const responded = relatedApps.filter((a) =>
        ["shortlisted", "accepted", "rejected", "withdrawn"].includes(a.status),
      ).length;
      const activeGigs = (await service.listGigs(venueId)).filter((g) => g.active)
        .length;

      return {
        venueId,
        bookings: venueBookings.length,
        revenuePaise,
        performerResponseRate:
          relatedApps.length === 0
            ? 1
            : Math.round((responded / relatedApps.length) * 1000) / 1000,
        upcomingEvents,
        activeGigs,
      };
    },

    async getAnalytics(venueId) {
      const metrics = await service.getDashboardMetrics(venueId);
      const events = (await options.repositories.events.list()).filter(
        (e) => e.venueId === venueId,
      );
      const bookings = await options.repositories.bookings.list();
      const venueBookings = bookings.filter((b) =>
        events.some((e) => e.id === b.eventId),
      );
      const cancelled = venueBookings.filter((b) => b.status === "cancelled").length;
      const applications = await options.repositories.applications.list();
      const eventIds = new Set(events.map((e) => e.id));
      const apps = applications.filter((a) => eventIds.has(a.eventId));
      const converted = apps.filter((a) => a.status === "accepted").length;

      return {
        venueId,
        totalEvents: events.length,
        revenuePaise: metrics.revenuePaise,
        bookingConversion:
          apps.length === 0 ? 0 : Math.round((converted / apps.length) * 1000) / 1000,
        cancellationRate:
          venueBookings.length === 0
            ? 0
            : Math.round((cancelled / venueBookings.length) * 1000) / 1000,
      };
    },

    async enrichVenueProfile(venue) {
      await ensureVenue(venue.id);
      const facilities = facilitiesByVenue.get(venue.id)!;
      return {
        ...venue,
        amenityIds: [
          ...new Set([...venue.amenityIds, ...amenityIdsFromFacilities(facilities)]),
        ],
        facilities,
        verification: verificationByVenue.get(venue.id)!,
        gallery: await service.listGallery(venue.id),
      };
    },

    async applyToEvent(input) {
      if (!options.lifecycle) throw validationError("Lifecycle unavailable.");
      return options.lifecycle.apply(input);
    },
    async withdrawApplication(input) {
      if (!options.lifecycle) throw validationError("Lifecycle unavailable.");
      return options.lifecycle.withdrawApplication(input);
    },
    async shortlistApplication(input) {
      if (!options.lifecycle) throw validationError("Lifecycle unavailable.");
      return options.lifecycle.shortlist(input);
    },
    async invitePerformer(input) {
      if (!options.lifecycle) throw validationError("Lifecycle unavailable.");
      return options.lifecycle.invitePerformer(input);
    },
    async rejectInvite(input) {
      if (!options.lifecycle) throw validationError("Lifecycle unavailable.");
      return options.lifecycle.rejectInvite(input);
    },
  };

  return service;
}
