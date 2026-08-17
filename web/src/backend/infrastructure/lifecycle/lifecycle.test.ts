import { beforeEach, describe, expect, it } from "vitest";

import { RoleName } from "@/backend/domain/enums";
import { BookingLifecycleStatus } from "@/backend/domain/booking-lifecycle";
import {
  canTransitionLifecycle,
  bookingLifecycleTransitions,
} from "@/backend/domain/booking-lifecycle";
import { resetBackendContainer, getBackendContainer } from "@/backend/infrastructure/container";
import { createMemoryAuthService } from "@/backend/infrastructure/security/auth-service";

describe("booking lifecycle state machine", () => {
  it("defines transitions for every status", () => {
    for (const status of Object.values(BookingLifecycleStatus)) {
      expect(bookingLifecycleTransitions[status]).toBeDefined();
    }
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionLifecycle("draft", "completed")).toBe(false);
    expect(canTransitionLifecycle("invited", "applied")).toBe(true);
    expect(canTransitionLifecycle("completed", "disputed")).toBe(true);
    expect(canTransitionLifecycle("cancelled", "confirmed")).toBe(false);
  });
});

describe("booking lifecycle workflow", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    resetBackendContainer();
  });

  async function seed() {
    const container = getBackendContainer();
    const auth = createMemoryAuthService();
    const organizer = await auth.register({
      email: `org-${Date.now()}@bandverse.test`,
      password: "password123",
      displayName: "Org",
      role: RoleName.ORGANIZER,
    });
    const events = await container.repositories.events.list();
    const performers = await container.repositories.performers.list();
    const event = events[0]!;
    const performer = performers[0]!;
    return { container, organizer, event, performer };
  }

  it("runs invite → accept → shortlist → confirm → pay → contract → complete", async () => {
    const { container, organizer, event, performer } = await seed();

    const invited = await container.lifecycle.invitePerformer({
      eventId: event.id,
      hostId: organizer.user.id,
      performerId: performer.id,
      actorUserId: organizer.user.id,
    });
    expect(invited.status).toBe("invited");

    const applied = await container.lifecycle.acceptInvite({
      lifecycleId: invited.id,
      actorUserId: organizer.user.id,
      quotedPaise: 50_000,
    });
    expect(applied.status).toBe("applied");
    expect(applied.applicationId).toBeTruthy();

    const shortlisted = await container.lifecycle.shortlist({
      lifecycleId: applied.id,
      actorUserId: organizer.user.id,
    });
    expect(shortlisted.status).toBe("shortlisted");

    const confirmed = await container.lifecycle.confirm({
      lifecycleId: shortlisted.id,
      actorUserId: organizer.user.id,
      agreedPaise: 50_000,
    });
    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.bookingId).toBeTruthy();

    const paid = await container.lifecycle.markAdvancePaid({
      lifecycleId: confirmed.id,
      actorUserId: organizer.user.id,
      amountPaise: 20_000,
    });
    expect(paid.lifecycle.status).toBe("advance_paid");

    await container.lifecycle.createContract({
      lifecycleId: paid.lifecycle.id,
      actorUserId: organizer.user.id,
      terms: "Perform 2 hours at venue.",
      performanceDate: new Date().toISOString(),
      durationMinutes: 120,
      feePaise: 50_000,
    });

    const upcoming = await container.lifecycle.signContract({
      lifecycleId: paid.lifecycle.id,
      actorUserId: organizer.user.id,
    });
    expect(upcoming.status).toBe("upcoming");

    const completed = await container.lifecycle.complete({
      lifecycleId: upcoming.id,
      actorUserId: organizer.user.id,
    });
    expect(completed.status).toBe("completed");

    const timeline = await container.lifecycle.timeline(completed.id);
    expect(timeline.length).toBeGreaterThan(5);
    expect(timeline.every((entry) => entry.timestamp && entry.action)).toBe(true);

    expect(await container.lifecycle.assertReviewAllowed(completed.bookingId!)).toBe(
      true,
    );

    const analytics = await container.lifecycle.analytics(organizer.user.id);
    expect(analytics.funnel.completed).toBeGreaterThanOrEqual(1);
    expect(analytics.revenuePaise).toBeGreaterThanOrEqual(50_000);
  });

  it("supports apply → withdraw and reject invite", async () => {
    const { container, organizer, event, performer } = await seed();

    const applied = await container.lifecycle.apply({
      eventId: event.id,
      performerId: performer.id,
      hostId: organizer.user.id,
      actorUserId: organizer.user.id,
      message: "We would love to perform",
      quotedPaise: 40_000,
    });
    expect(applied.status).toBe("applied");

    const withdrawn = await container.lifecycle.withdrawApplication({
      lifecycleId: applied.id,
      actorUserId: organizer.user.id,
    });
    expect(withdrawn.status).toBe("cancelled");

    const invited = await container.lifecycle.invitePerformer({
      eventId: event.id,
      hostId: organizer.user.id,
      performerId: performer.id,
      actorUserId: organizer.user.id,
    });
    // May reuse cancelled or create new — invite creates new if previous cancelled
    const invite =
      invited.status === "invited"
        ? invited
        : await container.lifecycle.invitePerformer({
            eventId: event.id,
            hostId: organizer.user.id,
            performerId: `${performer.id}_alt`,
            actorUserId: organizer.user.id,
          });

    // Fresh invite path
    const fresh = await container.lifecycle.invitePerformer({
      eventId: `event_fresh_${Date.now()}`,
      hostId: organizer.user.id,
      performerId: performer.id,
      actorUserId: organizer.user.id,
    });
    const rejected = await container.lifecycle.rejectInvite({
      lifecycleId: fresh.id,
      actorUserId: organizer.user.id,
    });
    expect(rejected.status).toBe("cancelled");
    void invite;
  });

  it("blocks invalid jumps", async () => {
    const { container, organizer, event, performer } = await seed();
    const invited = await container.lifecycle.invitePerformer({
      eventId: event.id,
      hostId: organizer.user.id,
      performerId: performer.id,
      actorUserId: organizer.user.id,
    });
    await expect(
      container.lifecycle.complete({
        lifecycleId: invited.id,
        actorUserId: organizer.user.id,
      }),
    ).rejects.toThrow(/transition/i);
  });

  it("blocks reviews before completion", async () => {
    const { container, organizer, event, performer } = await seed();
    const invited = await container.lifecycle.invitePerformer({
      eventId: event.id,
      hostId: organizer.user.id,
      performerId: performer.id,
      actorUserId: organizer.user.id,
    });
    expect(await container.lifecycle.assertReviewAllowed(invited.id)).toBe(false);
  });
});
