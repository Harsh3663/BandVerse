import { beforeEach, describe, expect, it } from "vitest";

import {
  getBackendContainer,
  resetBackendContainer,
} from "@/backend/infrastructure/container";
import {
  VENDOR_TYPES,
  buildBudgetEstimate,
  curatedVendorPackages,
  defaultRequirements,
  selectPackageForBrief,
} from "@/modules/event-planning";

describe("vendor taxonomy", () => {
  it("includes Indian cultural vendor types", () => {
    expect(VENDOR_TYPES).toContain("mehendi_artist");
    expect(VENDOR_TYPES).toContain("pandit_services");
    expect(VENDOR_TYPES).toContain("dhol_tasha_team");
    expect(VENDOR_TYPES).toContain("garba_team");
    expect(VENDOR_TYPES).toContain("bhajan_mandali");
    expect(VENDOR_TYPES).toContain("qawwali_group");
    expect(VENDOR_TYPES.length).toBe(21);
  });
});

describe("budget engine", () => {
  it("adds GST and service fees", () => {
    const estimate = buildBudgetEstimate({
      budget: 500_000,
      vendorCost: 200_000,
      venueCost: 100_000,
    });
    expect(estimate.subtotal).toBe(300_000);
    expect(estimate.taxes).toBe(54_000);
    expect(estimate.serviceFees).toBe(15_000);
    expect(estimate.total).toBe(369_000);
    expect(estimate.withinBudget).toBe(true);
  });
});

describe("packages and requirements", () => {
  it("ships curated Indian event packages", () => {
    const titles = curatedVendorPackages.map((p) => p.title);
    expect(titles).toContain("Wedding Music Package");
    expect(titles).toContain("Corporate Event Package");
    expect(titles).toContain("Garba Night Package");
    expect(titles).toContain("Traditional Maharashtrian Wedding Package");
    expect(titles).toContain("Luxury Wedding Package");
  });

  it("defaults wedding requirements to multi-vendor stack", () => {
    const reqs = defaultRequirements("wedding");
    expect(reqs).toEqual(
      expect.arrayContaining([
        { vendorType: "musician", quantity: 1 },
        { vendorType: "dj", quantity: 1 },
        { vendorType: "photographer", quantity: 2 },
        { vendorType: "decorator", quantity: 1 },
        { vendorType: "mehendi_artist", quantity: 2 },
      ]),
    );
  });

  it("selects a package within budget", () => {
    const pkg = selectPackageForBrief({
      eventTypeId: "wedding",
      budget: 400_000,
      guestCount: 300,
      city: "Pune",
    });
    expect(pkg).toBeDefined();
    expect(pkg!.eventTypeId).toBe("wedding");
  });
});

describe("EventPlanningService", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    resetBackendContainer();
  });

  it("discovers vendors by type, city, budget, and rating", async () => {
    const container = getBackendContainer();
    const vendors = await container.eventPlanning.listVendors({
      vendorType: "mehendi_artist",
      city: "Mumbai",
      budgetMax: 50_000,
      minRating: 4,
    });
    expect(vendors.length).toBeGreaterThan(0);
    expect(vendors.every((v) => v.vendorType === "mehendi_artist")).toBe(true);
  });

  it("builds event plans, customizes vendors, and estimates budget", async () => {
    const container = getBackendContainer();
    const plan = await container.eventPlanning.createEventPlan({
      title: "Riya & Aarav Wedding",
      eventTypeId: "wedding",
      city: "Mumbai",
      guestCount: 250,
      budget: 600_000,
      packageId: "pkg_wedding_music",
    });
    expect(plan.requirements.length).toBeGreaterThan(0);

    const vendors = await container.eventPlanning.listVendors({ city: "Mumbai" });
    const customized = await container.eventPlanning.customizePlan({
      planId: plan.id,
      selectedVendorIds: vendors.slice(0, 2).map((v) => v.id),
      packageId: "pkg_luxury_wedding",
    });
    expect(customized.selectedVendorIds.length).toBe(2);

    const estimate = await container.eventPlanning.estimateBudget({
      budget: 600_000,
      city: "Mumbai",
      guestCount: 250,
      packageId: "pkg_wedding_music",
      includeVenue: true,
    });
    expect(estimate.vendorCost).toBeGreaterThan(0);
    expect(estimate.taxes).toBeGreaterThan(0);
    expect(estimate.serviceFees).toBeGreaterThan(0);
    expect(estimate.total).toBeGreaterThan(estimate.subtotal);
  });

  it("returns AI planner stack with package and estimate", async () => {
    const container = getBackendContainer();
    const recommendation = await container.eventPlanning.planWithAi({
      eventTypeId: "wedding",
      budget: 500_000,
      city: "Mumbai",
      guestCount: 300,
    });
    expect(recommendation.vendorStack.length).toBeGreaterThan(0);
    expect(recommendation.estimate.total).toBeGreaterThan(0);
    expect(recommendation.reasons.length).toBeGreaterThan(0);
  });

  it("tracks package/vendor analytics and conversion", async () => {
    const container = getBackendContainer();
    await container.eventPlanning.track("package_view");
    await container.eventPlanning.track("vendor_view");
    await container.eventPlanning.track("quote_request");
    await container.eventPlanning.track("booking", 120_000);
    const analytics = await container.eventPlanning.getAnalytics();
    expect(analytics.packageViews).toBeGreaterThanOrEqual(1);
    expect(analytics.vendorViews).toBeGreaterThanOrEqual(1);
    expect(analytics.quoteRequests).toBeGreaterThanOrEqual(1);
    expect(analytics.bookings).toBe(1);
    expect(analytics.revenue).toBe(120_000);
    expect(analytics.conversionRate).toBeGreaterThan(0);
  });
});
