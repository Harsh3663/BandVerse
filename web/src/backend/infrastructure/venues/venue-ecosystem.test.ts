import { beforeEach, describe, expect, it } from "vitest";

import {
  getBackendContainer,
  resetBackendContainer,
} from "@/backend/infrastructure/container";
import {
  expandRecurringGigs,
  filterEventsByDiscovery,
  rankNearbyOpportunities,
} from "@/modules/venues";

describe("recurring gig engine", () => {
  it("expands weekly friday gigs into occurrences", () => {
    const occurrences = expandRecurringGigs(
      [
        {
          id: "g1",
          venueId: "v1",
          title: "Weekly Live Music",
          description: "",
          weekdays: ["friday"],
          startTime: "19:00",
          endTime: "22:00",
          neededRoles: ["guitarist", "singer", "duo band"],
          preferredGenreIds: [],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      { fromDate: "2026-08-01", toDate: "2026-08-31", venueId: "v1" },
    );
    expect(occurrences.length).toBeGreaterThan(0);
    expect(occurrences.every((o) => o.startTime === "19:00")).toBe(true);
    // 2026-08-07 is a Friday
    expect(occurrences.some((o) => o.date === "2026-08-07")).toBe(true);
  });
});

describe("event discovery filters", () => {
  it("filters by city and budget", () => {
    const events = [
      {
        location: { city: "Mumbai" },
        eventTypeId: "cafe",
        startsAt: "2026-09-01T19:00:00.000Z",
        budget: { maximum: { amount: 40_000 }, minimum: { amount: 20_000 } },
      },
      {
        location: { city: "Delhi" },
        eventTypeId: "wedding",
        startsAt: "2026-09-02T19:00:00.000Z",
        budget: { maximum: { amount: 200_000 } },
      },
    ];
    const filtered = filterEventsByDiscovery(events, {
      city: "Mumbai",
      budgetMax: 50_000,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.location.city).toBe("Mumbai");
  });
});

describe("nearby opportunity ranking", () => {
  it("ranks same-city opportunities higher", () => {
    const ranked = rankNearbyOpportunities("Pune", [
      {
        id: "1",
        kind: "event",
        title: "Pune night",
        city: "Pune",
        relevance: 0.5,
        reviewScore: 0.5,
        responseRate: 0.5,
        completionRate: 0.5,
      },
      {
        id: "2",
        kind: "event",
        title: "Goa night",
        city: "Goa",
        relevance: 0.9,
        reviewScore: 0.9,
        responseRate: 0.9,
        completionRate: 0.9,
      },
    ]);
    expect(ranked[0]?.city).toBe("Pune");
  });
});

describe("venue ecosystem service", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    resetBackendContainer();
  });

  it("manages facilities, gallery, verification, and gigs", async () => {
    const container = getBackendContainer();
    const venues = await container.repositories.venues.list();
    const venue = venues[0]!;

    const facilities = await container.venueEcosystem.upsertFacilities(venue.id, {
      stageAvailable: true,
      soundSystem: true,
      lighting: false,
      parking: true,
      foodAvailable: true,
      accommodationAvailable: false,
    });
    expect(facilities.stageAvailable).toBe(true);

    const photo = await container.venueEcosystem.addGalleryItem({
      venueId: venue.id,
      kind: "photo",
      title: "Stage",
      url: "https://cdn.example.com/stage.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 1024,
      originalName: "stage.jpg",
    });
    expect(photo.kind).toBe("photo");

    const tour = await container.venueEcosystem.addGalleryItem({
      venueId: venue.id,
      kind: "virtual_tour",
      title: "Walkthrough",
      url: "https://tours.example.com/venue",
    });
    expect(tour.kind).toBe("virtual_tour");

    const verification = await container.venueEcosystem.updateVerification(venue.id, {
      gstVerified: true,
      businessVerified: true,
    });
    expect(verification.gstVerified).toBe(true);

    const gig = await container.venueEcosystem.createGig({
      venueId: venue.id,
      title: "Weekly Live Music",
      weekdays: ["friday"],
      startTime: "19:00",
      endTime: "22:00",
      neededRoles: ["guitarist", "singer", "duo band"],
    });
    expect(gig.neededRoles).toContain("singer");

    const occurrences = await container.venueEcosystem.expandGigs({
      venueId: venue.id,
      fromDate: "2026-08-01",
      toDate: "2026-08-31",
    });
    expect(occurrences.length).toBeGreaterThan(0);

    const metrics = await container.venueEcosystem.getDashboardMetrics(venue.id);
    expect(metrics.activeGigs).toBeGreaterThanOrEqual(1);

    const analytics = await container.venueEcosystem.getAnalytics(venue.id);
    expect(analytics.venueId).toBe(venue.id);
  });

  it("discovers events and nearby opportunities", async () => {
    const container = getBackendContainer();
    const events = await container.repositories.events.list();
    const city = events[0]?.location.city ?? "Mumbai";
    const discovered = await container.venueEcosystem.discoverEvents({ city });
    expect(Array.isArray(discovered)).toBe(true);

    const nearby = await container.venueEcosystem.nearbyOpportunities({
      city,
      limit: 5,
    });
    expect(nearby.length).toBeGreaterThanOrEqual(0);
  });
});
