import type {
  ApplicationStatus,
  BookingStatus,
  MarketplaceEventTimelineItem,
  OrganizerAnalytics,
  OrganizerDashboardData,
  PerformerAnalytics,
  PerformerProfile,
} from "./types";
import type { Application, Booking } from "./types";

const activeBookingStatuses = new Set<BookingStatus>([
  "requested",
  "confirmed",
  "advance-pending",
  "advance-paid",
]);

const completedBookingStatuses = new Set<BookingStatus>(["completed", "reviewed"]);

const pendingApplicationStatuses = new Set<ApplicationStatus>([
  "submitted",
  "shortlisted",
]);

function timelineProgress(items: readonly MarketplaceEventTimelineItem[]): number {
  if (!items.length) return 0;
  const completed = items.filter(
    (item) => item.status === "completed" || item.status === "active",
  ).length;
  return Math.round((completed / items.length) * 100);
}

export function resolveOrganizerAnalytics(
  data: OrganizerDashboardData,
  referenceDate = new Date("2026-08-07T12:00:00+05:30"),
): OrganizerAnalytics {
  const upcomingEvents = data.events.filter(
    (event) => event.status === "published" && new Date(event.startsAt) >= referenceDate,
  );

  const eventIds = new Set(data.events.map((event) => event.id));
  const organizerApplications = data.applications.filter(({ event }) =>
    eventIds.has(event.id),
  );

  const pendingArtists = organizerApplications.filter(({ application }) =>
    pendingApplicationStatuses.has(application.status),
  ).length;

  const confirmedArtists = organizerApplications.filter(
    ({ application, booking }) =>
      application.status === "accepted" ||
      (booking ? activeBookingStatuses.has(booking.status) : false),
  ).length;

  const committedBookings = data.bookings.filter(({ booking }) =>
    [...activeBookingStatuses, ...completedBookingStatuses].includes(booking.status),
  );

  const budgetUsed = committedBookings.reduce(
    (total, { booking }) => total + booking.agreedPrice.amount,
    0,
  );

  const budgetAllocated = upcomingEvents.reduce(
    (total, event) => total + event.budget.maximum.amount,
    0,
  );

  const budgetUsedPercent = budgetAllocated
    ? Math.min(100, Math.round((budgetUsed / budgetAllocated) * 100))
    : committedBookings.length
      ? 100
      : 0;

  const eventsWithTimeline = upcomingEvents.filter((event) => event.timeline.length);
  const timelineProgressPercent = eventsWithTimeline.length
    ? Math.round(
        eventsWithTimeline.reduce(
          (total, event) => total + timelineProgress(event.timeline),
          0,
        ) / eventsWithTimeline.length,
      )
    : data.events.some((event) => event.timeline.length)
      ? Math.round(
          data.events
            .filter((event) => event.timeline.length)
            .reduce((total, event) => total + timelineProgress(event.timeline), 0) /
            data.events.filter((event) => event.timeline.length).length,
        )
      : 0;

  return {
    upcomingEvents: upcomingEvents.length,
    budgetUsed: { amount: budgetUsed, currency: "INR" },
    budgetAllocated: { amount: budgetAllocated, currency: "INR" },
    budgetUsedPercent,
    pendingArtists,
    confirmedArtists,
    timelineProgressPercent,
  };
}

export function resolvePerformerAnalytics(
  performer: PerformerProfile,
  applications: readonly Application[],
  bookings: readonly Booking[],
): PerformerAnalytics {
  const performerApplications = applications.filter(
    (application) => application.performerId === performer.id,
  );
  const performerBookings = bookings.filter(
    (booking) => booking.performerId === performer.id,
  );

  const activeAndCompleted = performerBookings.filter(
    (booking) =>
      activeBookingStatuses.has(booking.status) ||
      completedBookingStatuses.has(booking.status),
  );

  const revenue = performerBookings
    .filter((booking) => completedBookingStatuses.has(booking.status))
    .reduce((total, booking) => total + booking.agreedPrice.amount, 0);

  const completedApplications = performerApplications.filter(
    (application) => application.status === "completed",
  ).length;
  const eligibleApplications = performerApplications.filter((application) =>
    ["accepted", "completed", "rejected", "cancelled"].includes(application.status),
  ).length;
  const completionRatePercent = eligibleApplications
    ? Math.round((completedApplications / eligibleApplications) * 100)
    : performerApplications.length
      ? Math.round(
          (performerApplications.filter(
            (application) => application.status === "completed",
          ).length /
            performerApplications.length) *
            100,
        )
      : 0;

  const profileViews =
    performer.profileViews ??
    Math.max(
      48,
      performer.rating.count * 12 + (performer.experience.completedEvents ?? 0) * 3,
    );

  return {
    bookings: activeAndCompleted.length,
    revenue: { amount: revenue, currency: "INR" },
    rating: performer.rating.average,
    ratingCount: performer.rating.count,
    profileViews,
    responseTimeMinutes: performer.responseTimeMinutes ?? 24 * 60,
    completionRatePercent,
  };
}
