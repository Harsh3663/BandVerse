import { randomBytes } from "node:crypto";

import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import type { MatchingService } from "@/backend/infrastructure/matching/matching-service";
import {
  buildBudgetEstimate,
  curatedVendorPackages,
  defaultRequirements,
  estimatePackageVendorCost,
  estimateVenueCost,
  getVendorPackageById,
  isVendorType,
  planEvent,
  vendorTypeFromPerformerKind,
  type BudgetEstimate,
  type EventPlanDraft,
  type EventPlanningAnalytics,
  type EventVendorRequirement,
  type PlannerRecommendation,
  type VendorDiscoveryFilters,
  type VendorEventPackage,
  type VendorProfile,
  type VendorType,
} from "@/modules/event-planning";
import { notFoundError, validationError } from "@/backend/shared/errors";

function id(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

function analyticsSnapshot(c: {
  packageViews: number;
  vendorViews: number;
  quoteRequests: number;
  bookings: number;
  revenue: number;
}): EventPlanningAnalytics {
  return {
    ...c,
    conversionRate:
      c.quoteRequests === 0
        ? 0
        : Math.round((c.bookings / c.quoteRequests) * 10_000) / 10_000,
  };
}

export interface EventPlanningService {
  listVendorTypes(): Promise<readonly VendorType[]>;
  listVendors(filters?: VendorDiscoveryFilters): Promise<readonly VendorProfile[]>;
  getVendor(id: string): Promise<VendorProfile | undefined>;
  createVendor(input: Omit<VendorProfile, "id" | "createdAt" | "updatedAt">): Promise<VendorProfile>;
  listPackages(): Promise<readonly VendorEventPackage[]>;
  getPackage(idOrSlug: string): Promise<VendorEventPackage | undefined>;
  upsertPackage(
    input: Omit<VendorEventPackage, "id" | "createdAt"> & {
      id?: string;
      createdAt?: string;
    },
  ): Promise<VendorEventPackage>;
  createEventPlan(input: {
    title: string;
    eventTypeId: string;
    city: string;
    guestCount: number;
    budget: number;
    eventDate?: string;
    requirements?: readonly EventVendorRequirement[];
    packageId?: string;
  }): Promise<EventPlanDraft>;
  customizePlan(input: {
    planId: string;
    packageId?: string;
    selectedVendorIds?: readonly string[];
    venueId?: string;
    requirements?: readonly EventVendorRequirement[];
  }): Promise<EventPlanDraft>;
  estimateBudget(input: {
    budget: number;
    city: string;
    guestCount: number;
    packageId?: string;
    vendorIds?: readonly string[];
    includeVenue?: boolean;
  }): Promise<BudgetEstimate>;
  planWithAi(input: {
    eventTypeId: string;
    budget: number;
    city: string;
    guestCount: number;
    packageId?: string;
  }): Promise<PlannerRecommendation>;
  getDefaultRequirements(eventTypeId: string): Promise<readonly EventVendorRequirement[]>;
  track(event: "package_view" | "vendor_view" | "quote_request" | "booking", revenue?: number): Promise<EventPlanningAnalytics>;
  getAnalytics(): Promise<EventPlanningAnalytics>;
  seedFromPerformers(): Promise<number>;
}

export function createEventPlanningService(options: {
  repositories: PlatformRepositories;
  /** Read-only matching for venue suggestions — does not modify matching module. */
  matching?: MatchingService;
}): EventPlanningService {
  const vendors = new Map<string, VendorProfile>();
  const plans = new Map<string, EventPlanDraft>();
  const customPackages = new Map<string, VendorEventPackage>();
  const counters = {
    packageViews: 0,
    vendorViews: 0,
    quoteRequests: 0,
    bookings: 0,
    revenue: 0,
  };
  let seeded = false;

  async function ensureSeed() {
    if (seeded) return;
    seeded = true;
    await service.seedFromPerformers();
  }

  const service: EventPlanningService = {
    async listVendorTypes() {
      const { VENDOR_TYPES } = await import("@/modules/event-planning/vendor-taxonomy");
      return VENDOR_TYPES;
    },

    async listVendors(filters) {
      await ensureSeed();
      let items = [...vendors.values()];
      if (filters?.vendorType) {
        items = items.filter((v) => v.vendorType === filters.vendorType);
      }
      if (filters?.city) {
        const city = filters.city.toLocaleLowerCase("en-IN");
        items = items.filter(
          (v) =>
            v.city.toLocaleLowerCase("en-IN") === city ||
            v.coverageAreas.some((a) => a.toLocaleLowerCase("en-IN") === city),
        );
      }
      if (typeof filters?.budgetMax === "number") {
        items = items.filter(
          (v) => (v.pricing.typicalAmount ?? v.pricing.startingAmount) <= filters.budgetMax!,
        );
      }
      if (typeof filters?.budgetMin === "number") {
        items = items.filter(
          (v) => (v.pricing.typicalAmount ?? v.pricing.startingAmount) >= filters.budgetMin!,
        );
      }
      if (typeof filters?.minRating === "number") {
        items = items.filter((v) => v.reviews.average >= filters.minRating!);
      }
      if (filters?.availableOn) {
        items = items.filter(
          (v) => !v.availability.blockedDates.includes(filters.availableOn!),
        );
      }
      return items.sort((a, b) => b.reviews.average - a.reviews.average);
    },

    async getVendor(vendorId) {
      await ensureSeed();
      const vendor = vendors.get(vendorId);
      if (vendor) counters.vendorViews += 1;
      return vendor;
    },

    async createVendor(input) {
      if (!isVendorType(input.vendorType)) {
        throw validationError("Unsupported vendorType.");
      }
      if (!input.displayName?.trim()) throw validationError("displayName required.");
      const now = isoNow();
      const vendor: VendorProfile = {
        ...input,
        id: id("vendor"),
        displayName: input.displayName.trim(),
        createdAt: now,
        updatedAt: now,
      };
      vendors.set(vendor.id, vendor);
      return vendor;
    },

    async listPackages() {
      const items = [...curatedVendorPackages, ...customPackages.values()];
      counters.packageViews += items.length;
      return items;
    },

    async getPackage(idOrSlug) {
      const pkg =
        getVendorPackageById(idOrSlug) ??
        [...customPackages.values()].find(
          (p) => p.id === idOrSlug || p.slug === idOrSlug,
        );
      if (pkg) counters.packageViews += 1;
      return pkg;
    },

    async upsertPackage(input) {
      if (!input.title?.trim() || !input.slug?.trim()) {
        throw validationError("title and slug are required.");
      }
      if (!input.slots?.length) {
        throw validationError("package must include at least one vendor slot.");
      }
      for (const slot of input.slots) {
        if (!isVendorType(slot.vendorType)) {
          throw validationError(`Unsupported vendorType: ${slot.vendorType}`);
        }
      }
      const pkg: VendorEventPackage = {
        ...input,
        id: input.id?.trim() || id("pkg"),
        title: input.title.trim(),
        slug: input.slug.trim(),
        createdAt: input.createdAt ?? isoNow(),
      };
      customPackages.set(pkg.id, pkg);
      return pkg;
    },

    async createEventPlan(input) {
      if (!input.title?.trim()) throw validationError("title required.");
      if (!Number.isFinite(input.budget) || input.budget <= 0) {
        throw validationError("budget must be positive.");
      }
      const selectedPkg = input.packageId
        ? (getVendorPackageById(input.packageId) ??
          [...customPackages.values()].find(
            (p) => p.id === input.packageId || p.slug === input.packageId,
          ))
        : undefined;
      const requirements =
        input.requirements?.length
          ? input.requirements
          : selectedPkg
            ? selectedPkg.slots.map((s) => ({
                vendorType: s.vendorType,
                quantity: s.quantity,
              }))
            : defaultRequirements(input.eventTypeId);

      const now = isoNow();
      const plan: EventPlanDraft = {
        id: id("eplan"),
        title: input.title.trim(),
        eventTypeId: input.eventTypeId,
        city: input.city,
        guestCount: input.guestCount,
        budget: input.budget,
        eventDate: input.eventDate,
        requirements,
        selectedPackageId: input.packageId,
        selectedVendorIds: [],
        createdAt: now,
        updatedAt: now,
      };
      plans.set(plan.id, plan);
      return plan;
    },

    async customizePlan(input) {
      const existing = plans.get(input.planId);
      if (!existing) throw notFoundError("Event plan", input.planId);
      const updated: EventPlanDraft = {
        ...existing,
        selectedPackageId: input.packageId ?? existing.selectedPackageId,
        selectedVendorIds: input.selectedVendorIds ?? existing.selectedVendorIds,
        venueId: input.venueId ?? existing.venueId,
        requirements: input.requirements ?? existing.requirements,
        updatedAt: isoNow(),
      };
      plans.set(updated.id, updated);
      return updated;
    },

    async estimateBudget(input) {
      await ensureSeed();
      const pkg = input.packageId
        ? (getVendorPackageById(input.packageId) ??
          [...customPackages.values()].find(
            (p) => p.id === input.packageId || p.slug === input.packageId,
          ))
        : undefined;
      const selected = (input.vendorIds ?? [])
        .map((vid) => vendors.get(vid))
        .filter(Boolean) as VendorProfile[];

      const vendorCost = pkg
        ? estimatePackageVendorCost(pkg, selected)
        : selected.reduce(
            (sum, v) => sum + (v.pricing.typicalAmount ?? v.pricing.startingAmount),
            0,
          );

      const includeVenue = input.includeVenue ?? Boolean(pkg?.includesVenueEstimate);
      const venueCost = includeVenue
        ? estimateVenueCost({
            guestCount: input.guestCount,
            city: input.city,
            budget: input.budget,
          })
        : 0;

      counters.quoteRequests += 1;
      return buildBudgetEstimate({
        budget: input.budget,
        vendorCost,
        venueCost,
      });
    },

    async planWithAi(input) {
      await ensureSeed();
      let venueSuggestion:
        | { venueId: string; name: string; city: string; matchScore: number }
        | undefined;

      if (options.matching) {
        try {
          const venues = await options.matching.matchVenues({
            eventTypeId: input.eventTypeId,
            budget: input.budget,
            city: input.city,
            capacityNeeded: input.guestCount,
          });
          const top = venues[0];
          if (top) {
            venueSuggestion = {
              venueId: top.venueId,
              name: top.name,
              city: top.city,
              matchScore: top.matchScore,
            };
          }
        } catch {
          // matching is optional enrichment
        }
      }

      const recommendation = planEvent({
        ...input,
        vendors: [...vendors.values()],
        venueSuggestion,
      });
      counters.quoteRequests += 1;
      return recommendation;
    },

    async getDefaultRequirements(eventTypeId) {
      return defaultRequirements(eventTypeId);
    },

    async track(event, revenue = 0) {
      if (event === "package_view") counters.packageViews += 1;
      else if (event === "vendor_view") counters.vendorViews += 1;
      else if (event === "quote_request") counters.quoteRequests += 1;
      else if (event === "booking") {
        counters.bookings += 1;
        counters.revenue += revenue;
      }
      return analyticsSnapshot(counters);
    },

    async getAnalytics() {
      return analyticsSnapshot(counters);
    },

    async seedFromPerformers() {
      const performers = await options.repositories.performers.list();
      let created = 0;
      for (const performer of performers) {
        const vendorType = vendorTypeFromPerformerKind(performer.kind);
        if (!vendorType) continue;
        const existing = [...vendors.values()].find(
          (v) => v.handle === performer.handle && v.vendorType === vendorType,
        );
        if (existing) continue;
        const starting =
          performer.pricingPackages[0]?.price.amount ??
          Math.round(performer.rating.average * 12_000);
        await service.createVendor({
          handle: performer.handle,
          displayName: performer.displayName,
          vendorType,
          services: [
            ...performer.categoryIds,
            ...performer.skillIds.slice(0, 4),
          ],
          pricing: {
            currency: "INR",
            startingAmount: starting,
            typicalAmount: starting,
            negotiable: true,
          },
          coverageAreas: [
            performer.travel.baseLocation.city,
            ...(performer.travel.nationwide ? ["Pan-India"] : []),
          ],
          teamSize: performer.memberCount ?? 1,
          availability: {
            timezone: performer.availability.timezone,
            blockedDates: performer.availability.blockedDates,
            weeklyOpenDays: performer.availability.weekly
              .filter((w) => w.ranges.length > 0)
              .map((w) => w.weekday),
          },
          portfolioUrls: performer.videos
            .slice(0, 3)
            .map((v) => (typeof v.source === "string" ? v.source : v.source.src)),
          reviews: {
            average: performer.rating.average,
            count: performer.rating.count,
          },
          verification: {
            verified: performer.verified,
            phoneVerified: true,
            emailVerified: true,
            businessVerified: performer.verified,
          },
          city: performer.travel.baseLocation.city,
          state: performer.travel.baseLocation.state,
          description: performer.headline,
        });
        created += 1;
      }

      // Seed non-performer cultural/service vendors for planner demos
      const extras: Array<Omit<VendorProfile, "id" | "createdAt" | "updatedAt">> = [
        {
          handle: "mehendi-by-aisha",
          displayName: "Mehendi by Aisha",
          vendorType: "mehendi_artist",
          services: ["bridal mehendi", "guest mehendi"],
          pricing: {
            currency: "INR",
            startingAmount: 8_000,
            typicalAmount: 15_000,
            negotiable: true,
          },
          coverageAreas: ["Mumbai", "Pune"],
          teamSize: 3,
          availability: {
            timezone: "Asia/Kolkata",
            blockedDates: [],
            weeklyOpenDays: ["friday", "saturday", "sunday"],
          },
          portfolioUrls: ["https://cdn.example.com/mehendi.jpg"],
          reviews: { average: 4.8, count: 62 },
          verification: {
            verified: true,
            phoneVerified: true,
            emailVerified: true,
            businessVerified: true,
          },
          city: "Mumbai",
          state: "Maharashtra",
          description: "Bridal and guest mehendi for weddings.",
        },
        {
          handle: "shubh-decor",
          displayName: "Shubh Decor Studio",
          vendorType: "decorator",
          services: ["mandap", "stage", "floral"],
          pricing: {
            currency: "INR",
            startingAmount: 75_000,
            typicalAmount: 120_000,
            negotiable: true,
          },
          coverageAreas: ["Pune", "Mumbai", "Nashik"],
          teamSize: 12,
          availability: {
            timezone: "Asia/Kolkata",
            blockedDates: [],
            weeklyOpenDays: ["thursday", "friday", "saturday", "sunday"],
          },
          portfolioUrls: ["https://cdn.example.com/decor.jpg"],
          reviews: { average: 4.6, count: 41 },
          verification: {
            verified: true,
            phoneVerified: true,
            emailVerified: true,
            businessVerified: true,
          },
          city: "Pune",
          state: "Maharashtra",
          description: "Wedding and cultural event décor.",
        },
        {
          handle: "lens-katha",
          displayName: "Lens Katha",
          vendorType: "photographer",
          services: ["wedding photography", "candid"],
          pricing: {
            currency: "INR",
            startingAmount: 45_000,
            typicalAmount: 70_000,
            negotiable: true,
          },
          coverageAreas: ["Mumbai", "Goa", "Jaipur"],
          teamSize: 4,
          availability: {
            timezone: "Asia/Kolkata",
            blockedDates: [],
            weeklyOpenDays: ["friday", "saturday", "sunday"],
          },
          portfolioUrls: ["https://cdn.example.com/photo.jpg"],
          reviews: { average: 4.9, count: 88 },
          verification: {
            verified: true,
            phoneVerified: true,
            emailVerified: true,
            businessVerified: true,
          },
          city: "Mumbai",
          state: "Maharashtra",
          description: "Documentary wedding photography.",
        },
        {
          handle: "dhol-pathak-pune",
          displayName: "Pune Dhol-Tasha Pathak",
          vendorType: "dhol_tasha_team",
          services: ["baraat", "procession"],
          pricing: {
            currency: "INR",
            startingAmount: 50_000,
            typicalAmount: 80_000,
            negotiable: true,
          },
          coverageAreas: ["Pune", "Mumbai"],
          teamSize: 25,
          availability: {
            timezone: "Asia/Kolkata",
            blockedDates: [],
            weeklyOpenDays: ["saturday", "sunday"],
          },
          portfolioUrls: ["https://cdn.example.com/dhol.jpg"],
          reviews: { average: 4.7, count: 35 },
          verification: {
            verified: true,
            phoneVerified: true,
            emailVerified: true,
            businessVerified: false,
          },
          city: "Pune",
          state: "Maharashtra",
          description: "Traditional dhol-tasha for Maharashtrian weddings.",
        },
      ];

      for (const extra of extras) {
        if (![...vendors.values()].some((v) => v.handle === extra.handle)) {
          await service.createVendor(extra);
          created += 1;
        }
      }
      return created;
    },
  };

  return service;
}
