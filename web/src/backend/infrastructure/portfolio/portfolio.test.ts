import { beforeEach, describe, expect, it } from "vitest";

import {
  computeDiscoveryBoost,
  computePortfolioCompleteness,
  validatePortfolioMediaUrl,
} from "@/backend/domain/portfolio";
import {
  getBackendContainer,
  resetBackendContainer,
} from "@/backend/infrastructure/container";

describe("portfolio media validation", () => {
  it("accepts platform-specific URLs", () => {
    expect(
      validatePortfolioMediaUrl("youtube", "https://www.youtube.com/watch?v=abc"),
    ).toEqual({ ok: true });
    expect(
      validatePortfolioMediaUrl("instagram_reel", "https://www.instagram.com/reel/abc"),
    ).toEqual({ ok: true });
    expect(
      validatePortfolioMediaUrl("spotify", "https://open.spotify.com/track/abc"),
    ).toEqual({ ok: true });
    expect(
      validatePortfolioMediaUrl("website", "https://artist.example.com"),
    ).toEqual({ ok: true });
  });

  it("rejects mismatched hosts", () => {
    const result = validatePortfolioMediaUrl(
      "youtube",
      "https://vimeo.com/123",
    );
    expect(result.ok).toBe(false);
  });
});

describe("discovery ranking", () => {
  it("scores verified, complete, responsive performers higher", () => {
    const strong = computeDiscoveryBoost({
      ratingAverage: 4.9,
      ratingCount: 40,
      verifiedPerformanceCount: 5,
      portfolioCompleteness: 1,
      responseTimeMinutes: 20,
      bookingSuccessRate: 0.9,
    });
    const weak = computeDiscoveryBoost({
      ratingAverage: 3,
      ratingCount: 1,
      verifiedPerformanceCount: 0,
      portfolioCompleteness: 0.1,
      responseTimeMinutes: 600,
      bookingSuccessRate: 0.2,
    });
    expect(strong.total).toBeGreaterThan(weak.total);
  });

  it("computes portfolio completeness from assets", () => {
    const score = computePortfolioCompleteness({
      mediaCount: 6,
      hasHero: true,
      hasFeaturedVideo: true,
      setlistCount: 2,
      hasAvailability: true,
      socialLinkTypes: ["youtube", "spotify"],
    });
    expect(score).toBeGreaterThanOrEqual(0.9);
  });
});

describe("portfolio service", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    resetBackendContainer();
  });

  async function seedPerformer() {
    const container = getBackendContainer();
    const performers = await container.repositories.performers.list();
    return { container, performer: performers[0]! };
  }

  it("supports portfolio media CRUD", async () => {
    const { container, performer } = await seedPerformer();
    const created = await container.portfolio.createMedia({
      performerId: performer.id,
      title: "Sangeet highlight",
      description: "Live set",
      mediaType: "youtube",
      url: "https://www.youtube.com/watch?v=demo123",
      featured: true,
      hero: true,
      duration: 180,
    });
    expect(created.id).toBeTruthy();
    expect(created.performerId).toBe(performer.id);

    const listed = await container.portfolio.listMedia(performer.id);
    expect(listed.some((m) => m.id === created.id)).toBe(true);

    const updated = await container.portfolio.updateMedia(created.id, {
      title: "Updated highlight",
    });
    expect(updated.title).toBe("Updated highlight");

    await container.portfolio.deleteMedia(created.id);
    const after = await container.portfolio.listMedia(performer.id);
    expect(after.some((m) => m.id === created.id)).toBe(false);
  });

  it("rejects invalid media URLs on create", async () => {
    const { container, performer } = await seedPerformer();
    await expect(
      container.portfolio.createMedia({
        performerId: performer.id,
        title: "Bad youtube",
        mediaType: "youtube",
        url: "https://example.com/not-youtube",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("creates setlists for supported event types", async () => {
    const { container, performer } = await seedPerformer();
    const setlist = await container.portfolio.createSetlist({
      performerId: performer.id,
      title: "Wedding Setlist",
      songs: ["Mere Yaaraa", "Kesariya"],
      duration: 45,
      eventType: "wedding",
    });
    expect(setlist.eventType).toBe("wedding");
    const listed = await container.portfolio.listSetlists(performer.id);
    expect(listed).toHaveLength(1);
  });

  it("manages verified performances and badge status", async () => {
    const { container, performer } = await seedPerformer();
    const events = await container.repositories.events.list();
    const verified = await container.portfolio.requestVerification({
      eventId: events[0]!.id,
      organizerId: "org_test",
      performerId: performer.id,
    });
    expect(verified.verificationStatus).toBe("pending");

    const approved = await container.portfolio.reviewVerification({
      id: verified.id,
      status: "verified",
    });
    expect(approved.verificationStatus).toBe("verified");

    const showcase = await container.portfolio.getShowcase(performer.id);
    expect(
      showcase.verifiedPerformances.some((v) => v.verificationStatus === "verified"),
    ).toBe(true);
  });

  it("supports monthly availability and lifecycle sync", async () => {
    const { container, performer } = await seedPerformer();
    await container.portfolio.upsertAvailabilityDay({
      performerId: performer.id,
      date: "2030-06-15",
      status: "blocked",
    });
    const month = await container.portfolio.getMonth({
      performerId: performer.id,
      year: 2030,
      month: 6,
    });
    expect(month.days).toHaveLength(30);
    expect(month.days.find((d) => d.date === "2030-06-15")?.status).toBe("blocked");
    expect(month.days.find((d) => d.date === "2030-06-01")?.status).toBe(
      "available",
    );

    const events = await container.repositories.events.list();
    const invited = await container.lifecycle.invitePerformer({
      eventId: events[0]!.id,
      hostId: "host_test",
      performerId: performer.id,
      actorUserId: "host_test",
    });
    await container.lifecycle.acceptInvite({
      lifecycleId: invited.id,
      actorUserId: "host_test",
      quotedPaise: 40_000,
    });
    const shortlisted = await container.lifecycle.shortlist({
      lifecycleId: invited.id,
      actorUserId: "host_test",
    });
    await container.lifecycle.confirm({
      lifecycleId: shortlisted.id,
      actorUserId: "host_test",
      agreedPaise: 40_000,
    });

    const synced = await container.portfolio.syncAvailabilityFromLifecycle(
      performer.id,
    );
    const eventDate = events[0]!.startsAt.slice(0, 10);
    const syncedDay = synced.days.find((d) => d.date === eventDate);
    if (syncedDay) {
      expect(syncedDay.status).toBe("booked");
    } else {
      // Event may fall outside current month returned by sync — still assert upsert path.
      const explicit = await container.portfolio.getMonth({
        performerId: performer.id,
        year: Number(eventDate.slice(0, 4)),
        month: Number(eventDate.slice(5, 7)),
      });
      expect(explicit.days.find((d) => d.date === eventDate)?.status).toBe("booked");
    }
  });

  it("tracks media analytics and ranking boost", async () => {
    const { container, performer } = await seedPerformer();
    await container.portfolio.trackEvent({
      performerId: performer.id,
      event: "portfolio_view",
    });
    await container.portfolio.trackEvent({
      performerId: performer.id,
      event: "click",
    });
    await container.portfolio.trackEvent({
      performerId: performer.id,
      event: "booking_start",
    });
    await container.portfolio.trackEvent({
      performerId: performer.id,
      event: "booking_conversion",
    });
    const analytics = await container.portfolio.getAnalytics(performer.id);
    expect(analytics.portfolioViews).toBe(1);
    expect(analytics.ctr).toBeGreaterThan(0);
    expect(analytics.bookingConversionRate).toBe(1);

    const widgets = await container.portfolio.getAnalyticsWidgets(performer.id);
    expect(widgets.widgets.length).toBeGreaterThanOrEqual(5);

    await container.portfolio.createMedia({
      performerId: performer.id,
      title: "Hero",
      mediaType: "photo",
      url: "https://cdn.example.com/hero.jpg",
      hero: true,
    });
    await container.portfolio.requestVerification({
      eventId: "evt_rank",
      organizerId: "org",
      performerId: performer.id,
    }).then((v) =>
      container.portfolio.reviewVerification({ id: v.id, status: "verified" }),
    );

    const performers = await container.repositories.performers.list();
    const ranked = await container.portfolio.rankPerformers(
      performers.slice(0, 3).map((p) => p.id),
    );
    expect(ranked[0]?.score.total).toBeGreaterThanOrEqual(
      ranked[ranked.length - 1]?.score.total ?? 0,
    );
  });
});
