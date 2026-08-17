import { beforeEach, describe, expect, it } from "vitest";

import {
  getBackendContainer,
  resetBackendContainer,
} from "@/backend/infrastructure/container";
import {
  MATCH_WEIGHTS,
  combineWeightedScores,
  createTalentMatchingEngine,
} from "@/modules/matching";

describe("match score weights", () => {
  it("sums to 100", () => {
    const sum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("combines weighted factors into 0–100 total", () => {
    const perfect = combineWeightedScores({
      experience: 100,
      portfolioQuality: 100,
      reviews: 100,
      responseRate: 100,
      distance: 100,
      budgetFit: 100,
      categoryMatch: 100,
      languageMatch: 100,
      availability: 100,
      pastSuccess: 100,
    });
    expect(perfect.total).toBe(100);

    const mid = combineWeightedScores({
      experience: 50,
      portfolioQuality: 50,
      reviews: 50,
      responseRate: 50,
      distance: 50,
      budgetFit: 50,
      categoryMatch: 50,
      languageMatch: 50,
      availability: 50,
      pastSuccess: 50,
    });
    expect(mid.total).toBe(50);
  });
});

describe("TalentMatchingEngine", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    resetBackendContainer();
  });

  it("returns recommendation bundles with whyRecommended", async () => {
    const container = getBackendContainer();
    const performers = await container.repositories.performers.list();
    const engine = createTalentMatchingEngine();
    const bundles = engine.matchPerformers(performers, {
      eventTypeId: "wedding",
      budget: 80_000,
      city: performers[0]?.travel.baseLocation.city ?? "Mumbai",
      date: "2026-12-12",
      audienceSize: 200,
      genreIds: performers[0]?.genreIds.slice(0, 2) ?? [],
      languageIds: performers[0]?.languageIds.slice(0, 2) ?? [],
    });

    expect(bundles.topPerformers.length).toBeGreaterThan(0);
    expect(bundles.topPerformers.length).toBeLessThanOrEqual(10);
    expect(bundles.topBands.length).toBeLessThanOrEqual(5);
    expect(bundles.topLocal.length).toBeGreaterThan(0);
    expect(bundles.bestValue.length).toBeGreaterThan(0);
    expect(bundles.premium.length).toBeGreaterThan(0);

    const top = bundles.topPerformers[0]!;
    expect(top.matchScore).toBeGreaterThanOrEqual(0);
    expect(top.matchScore).toBeLessThanOrEqual(100);
    expect(top.whyRecommended).toContain("Match Score");
    expect(top.reasons.length).toBeGreaterThan(0);
  });

  it("ranks venues by capacity/location/amenities", async () => {
    const container = getBackendContainer();
    const venues = await container.repositories.venues.list();
    const engine = createTalentMatchingEngine();
    const city = venues[0]?.location.city ?? "Mumbai";
    const ranked = engine.matchVenues(venues, {
      eventTypeId: "corporate",
      budget: 100_000,
      city,
      capacityNeeded: 100,
      requiredAmenities: venues[0]?.amenityIds.slice(0, 2) ?? ["parking"],
    });
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0]!.matchScore).toBeGreaterThanOrEqual(
      ranked[ranked.length - 1]!.matchScore,
    );
    expect(ranked[0]!.whyRecommended).toContain("Match Score");
  });

  it("suggests events for performers", async () => {
    const container = getBackendContainer();
    const performers = await container.repositories.performers.list();
    const events = await container.repositories.events.list();
    const engine = createTalentMatchingEngine();
    const suggestions = engine.suggestEventsForPerformer(
      performers[0]!,
      events,
      5,
    );
    expect(suggestions.length).toBeGreaterThanOrEqual(0);
    if (suggestions[0]) {
      expect(suggestions[0].whyRecommended).toContain("Match Score");
    }
  });
});

describe("matching service + analytics", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    resetBackendContainer();
  });

  it("serves API-shaped performer/venue/event matching and tracks funnel", async () => {
    const container = getBackendContainer();
    const performers = await container.repositories.performers.list();
    const city = performers[0]!.travel.baseLocation.city;

    const bundles = await container.matching.matchPerformers({
      eventTypeId: "cafe",
      budget: 50_000,
      city,
      audienceSize: 80,
    });
    expect(bundles.topPerformers.length).toBeGreaterThan(0);

    const venues = await container.matching.matchVenues({
      eventTypeId: "cafe",
      budget: 50_000,
      city,
      capacityNeeded: 50,
    });
    expect(venues.length).toBeGreaterThan(0);

    const suggested = await container.matching.suggestEventsForPerformer(
      performers[0]!.id,
      5,
    );
    expect(Array.isArray(suggested)).toBe(true);

    await container.matching.track("click");
    await container.matching.track("application");
    await container.matching.track("booking");
    const analytics = await container.matching.getAnalytics();
    expect(analytics.impressions).toBeGreaterThan(0);
    expect(analytics.clicks).toBeGreaterThanOrEqual(1);
    expect(analytics.applications).toBeGreaterThanOrEqual(1);
    expect(analytics.bookings).toBeGreaterThanOrEqual(1);
    expect(analytics.clickThroughRate).toBeGreaterThanOrEqual(0);
    expect(analytics.conversionRate).toBeGreaterThanOrEqual(0);
  });
});
