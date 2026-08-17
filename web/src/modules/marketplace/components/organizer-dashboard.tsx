import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/result-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { eventTypes } from "../config/event-types";
import { resolveOrganizerAnalytics } from "../analytics";
import { formatDateTime, titleCase } from "../format";
import type {
  MarketplaceEvent,
  OrganizerApplicationContext,
  OrganizerBookingContext,
  OrganizerDashboardData,
  VenueProfile,
} from "../types";
import { ApplicationInbox } from "./application-workflow";
import { AnalyticsSummaryLink } from "./analytics-panel";
import { BookingSummaryCard } from "./booking-workflow";
import { OpportunityCard } from "./opportunity";
import { VenueDetails, VenueSchedule } from "./venue-profile";
import { TrustBadges } from "./trust";

export function OrganizerPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-primary font-medium">Organizer dashboard</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-balance">{title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function OrganizerDashboardOverview({ data }: { data: OrganizerDashboardData }) {
  const analytics = resolveOrganizerAnalytics(data);
  const submitted = data.applications.filter(
    ({ application }) => application.status === "submitted",
  ).length;
  const upcoming = data.events.filter((event) => event.status === "published");

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title={`Welcome back, ${data.persona.displayName}`}
        description={`Manage ${data.venue.name}'s programme, artist decisions, and booking activity from one place.`}
        action={
          <div className="flex flex-wrap gap-2">
            <AnalyticsSummaryLink href={"/dashboard/organizer/analytics" as Route} />
            <Button asChild>
              <Link href={"/dashboard/organizer/events" as Route}>
                View events <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        }
      />

      <section
        aria-label="Organizer activity summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <SummaryCard
          label="Upcoming events"
          count={analytics.upcomingEvents}
          icon={<CalendarDays />}
          href="/dashboard/organizer/analytics"
        />
        <SummaryCard
          label="Pending artists"
          count={analytics.pendingArtists}
          icon={<Users />}
          href="/dashboard/organizer/analytics"
        />
        <SummaryCard
          label="Confirmed artists"
          count={analytics.confirmedArtists}
          icon={<CheckCircle2 />}
          href="/dashboard/organizer/analytics"
        />
        <SummaryCard
          label="Open events"
          count={upcoming.length}
          icon={<CalendarDays />}
          href="/dashboard/organizer/events"
        />
        <SummaryCard
          label="New applications"
          count={submitted}
          icon={<FileText />}
          href="/dashboard/organizer/applications"
        />
      </section>

      <section aria-label="Analytics snapshot" className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Analytics snapshot</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {analytics.timelineProgressPercent}% average timeline progress ·{" "}
              {analytics.budgetUsedPercent}% budget committed
            </p>
          </div>
          <AnalyticsSummaryLink href={"/dashboard/organizer/analytics" as Route} />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="upcoming-events-heading">
        <SectionHeading
          id="upcoming-events-heading"
          title="Upcoming events"
          description="The next published opportunities on your programme."
          href="/dashboard/organizer/events"
        />
        <OrganizerEventGrid events={upcoming.slice(0, 2)} />
      </section>

      <section className="space-y-4" aria-labelledby="recent-applications-heading">
        <SectionHeading
          id="recent-applications-heading"
          title="Recent applications"
          description="Latest artist proposals awaiting or following a decision."
          href="/dashboard/organizer/applications"
        />
        <OrganizerApplicationGroups records={data.applications.slice(0, 3)} />
      </section>
    </div>
  );
}

export function OrganizerVenueProfile({ venue }: { venue: VenueProfile }) {
  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Venue Profile"
        description="Review the venue details artists see before they apply."
        action={
          <Button asChild variant="outline">
            <Link href={`/venue/${venue.handle}` as Route}>View public profile</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{titleCase(venue.type)}</Badge>
            {venue.verified ? <Badge variant="secondary">Verified</Badge> : null}
          </div>
          <CardTitle className="font-display text-3xl">{venue.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TrustBadges signals={venue.trustSignals} compact />
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="size-4" aria-hidden="true" />
            {venue.location.city}, {venue.location.state}
          </p>
          <p className="max-w-3xl leading-relaxed">{venue.description}</p>
        </CardContent>
      </Card>
      <VenueDetails venue={venue} />
      <VenueSchedule venue={venue} />
    </div>
  );
}

export function OrganizerEvents({ events }: { events: readonly MarketplaceEvent[] }) {
  return events.length ? (
    <OrganizerEventGrid events={events} />
  ) : (
    <EmptyState
      title="No events yet"
      description="Events created for this venue will appear here."
    />
  );
}

export function OrganizerApplicationGroups({
  records,
}: {
  records: readonly OrganizerApplicationContext[];
}) {
  if (!records.length) {
    return (
      <EmptyState
        title="No applications"
        description="Artist proposals for this venue's events will appear here."
      />
    );
  }

  const grouped = records.reduce((groups, record) => {
    const group = groups.get(record.event.id);
    if (group) group.push(record);
    else groups.set(record.event.id, [record]);
    return groups;
  }, new Map<string, OrganizerApplicationContext[]>());
  return (
    <div className="space-y-6">
      {[...grouped.values()].map((group) => {
        const first = group[0];
        return (
          <section
            key={first.event.id}
            id={first.event.id}
            aria-labelledby={`${first.event.id}-heading`}
            className="scroll-mt-24 space-y-3"
          >
            <div>
              <h2
                id={`${first.event.id}-heading`}
                className="font-display text-2xl font-semibold"
              >
                {first.event.title}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatDateTime(first.event.startsAt)} · {group.length}{" "}
                {group.length === 1 ? "application" : "applications"}
              </p>
            </div>
            <ApplicationInbox
              initialApplications={group.map(({ application }) => application)}
              performers={group.map(({ performer }) => performer)}
            />
          </section>
        );
      })}
    </div>
  );
}

export function OrganizerConfirmedArtists({
  records,
}: {
  records: readonly OrganizerApplicationContext[];
}) {
  if (!records.length) {
    return (
      <EmptyState
        title="No confirmed artists"
        description="Accepted applications and active confirmed bookings will appear here."
      />
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {records.map(({ application, booking, event, performer }) =>
        booking ? (
          <BookingSummaryCard
            key={application.id}
            booking={booking}
            event={event}
            performer={performer}
            href={`/bookings/${booking.id}` as Route}
          />
        ) : (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>{performer.displayName}</CardTitle>
                <Badge variant="secondary">Accepted</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{event.title}</p>
              <p className="text-muted-foreground text-sm">
                {formatDateTime(event.startsAt)}
              </p>
              <Button asChild variant="outline">
                <Link href={`/dashboard/organizer/applications#${event.id}` as Route}>
                  View application
                </Link>
              </Button>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}

export function OrganizerBookingHistory({
  records,
}: {
  records: readonly OrganizerBookingContext[];
}) {
  if (!records.length) {
    return (
      <EmptyState
        title="No booking history"
        description="Completed and cancelled bookings will appear here."
      />
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {records.map(({ booking, event, performer }) => (
        <BookingSummaryCard
          key={booking.id}
          booking={booking}
          event={event}
          performer={performer}
          href={`/bookings/${booking.id}` as Route}
        />
      ))}
    </div>
  );
}

function OrganizerEventGrid({ events }: { events: readonly MarketplaceEvent[] }) {
  if (!events.length) {
    return (
      <EmptyState
        title="No upcoming events"
        description="Published events will appear here when they are ready for applications."
      />
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => {
        const eventType = eventTypes.find(({ id }) => id === event.eventTypeId);
        if (!eventType) return null;
        const href =
          event.status === "published"
            ? (`/opportunities/${event.id}` as Route)
            : (`/dashboard/organizer/applications#${event.id}` as Route);
        return (
          <OpportunityCard
            key={event.id}
            event={event}
            eventType={eventType}
            href={href}
          />
        );
      })}
    </div>
  );
}

function SummaryCard({
  label,
  count,
  icon,
  href,
}: {
  label: string;
  count: number;
  icon: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href as Route}
      className="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-3"
    >
      <Card size="sm" className="hover:border-primary/50 h-full transition-colors">
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-display mt-1 text-3xl font-semibold">{count}</p>
          </div>
          <span className="bg-primary/10 text-primary rounded-full p-3 [&>svg]:size-5">
            {icon}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function SectionHeading({
  id,
  title,
  description,
  href,
}: {
  id: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="font-display text-2xl font-semibold">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <Button asChild variant="outline">
        <Link href={href as Route}>View all</Link>
      </Button>
    </div>
  );
}
