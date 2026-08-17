import type { Metadata, Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  DashboardShell,
  type DashboardNavigationItem,
} from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBackendContainer } from "@/backend/infrastructure/container";
import { mockMarketplaceRepositories } from "@/modules/marketplace";
import { describeWeeklyGig } from "@/modules/venues";

export const metadata: Metadata = {
  title: "Venue dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const navigation: readonly DashboardNavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard/venue" as Route,
    icon: "overview",
    exact: true,
  },
  {
    label: "Venue directory",
    href: "/venues" as Route,
    icon: "settings",
  },
  {
    label: "Discover events",
    href: "/events/discover" as Route,
    icon: "events",
  },
];

export default async function VenueDashboardPage() {
  const venues = await mockMarketplaceRepositories.venues.list();
  const venue = venues[0];
  if (!venue) {
    return (
      <DashboardShell navigation={navigation} personaName="Venue" personaKind="Venue">
        <Container className="py-10">
          <p>No venues available.</p>
        </Container>
      </DashboardShell>
    );
  }

  const ecosystem = getBackendContainer().venueEcosystem;
  await ecosystem.upsertFacilities(venue.id, {
    stageAvailable: true,
    soundSystem: true,
    lighting: true,
    parking: true,
    foodAvailable: true,
    accommodationAvailable: venue.type === "hotel" || venue.type === "resort",
  });
  await ecosystem.updateVerification(venue.id, {
    gstVerified: true,
    businessVerified: venue.verified,
    phoneVerified: Boolean(venue.contact.phone),
    emailVerified: Boolean(venue.contact.email),
  });

  const existingGigs = await ecosystem.listGigs(venue.id);
  if (existingGigs.length === 0) {
    await ecosystem.createGig({
      venueId: venue.id,
      title: "Weekly Live Music",
      description: "Friday night live set",
      weekdays: ["friday"],
      startTime: "19:00",
      endTime: "22:00",
      neededRoles: ["guitarist", "singer", "duo band"],
      preferredGenreIds: venue.preferredGenreIds.slice(0, 3),
    });
  }

  const [metrics, analytics, gigs, verification, gallery] = await Promise.all([
    ecosystem.getDashboardMetrics(venue.id),
    ecosystem.getAnalytics(venue.id),
    ecosystem.listGigs(venue.id),
    ecosystem.getVerification(venue.id),
    ecosystem.listGallery(venue.id),
  ]);

  return (
    <DashboardShell navigation={navigation} personaName={venue.name} personaKind="Venue">
      <Container className="space-y-10 py-8 sm:py-10">
        <header className="space-y-2">
          <p className="text-primary font-medium">Venue dashboard</p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            {venue.name}
          </h1>
          <p className="text-muted-foreground">
            {venue.location.city}, {venue.location.state} · {venue.type}
          </p>
          <div className="flex flex-wrap gap-2">
            {verification.gstVerified ? <Badge>GST verified</Badge> : null}
            {verification.businessVerified ? <Badge>Business verified</Badge> : null}
            {verification.phoneVerified ? <Badge>Phone verified</Badge> : null}
            {verification.emailVerified ? <Badge>Email verified</Badge> : null}
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Metrics">
          {[
            { label: "Bookings", value: String(metrics.bookings) },
            {
              label: "Revenue",
              value: `₹${Math.round(metrics.revenuePaise / 100).toLocaleString("en-IN")}`,
            },
            {
              label: "Performer response",
              value: `${Math.round(metrics.performerResponseRate * 100)}%`,
            },
            { label: "Upcoming events", value: String(metrics.upcomingEvents) },
            { label: "Active gigs", value: String(metrics.activeGigs) },
          ].map((item) => (
            <div key={item.label} className="border-border rounded-lg border p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                {item.label}
              </p>
              <p className="font-display mt-1 text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3" aria-labelledby="venue-analytics">
          <h2 id="venue-analytics" className="font-display text-2xl font-semibold">
            Analytics
          </h2>
          <ul className="text-sm space-y-1">
            <li>Total events: {analytics.totalEvents}</li>
            <li>
              Booking conversion: {Math.round(analytics.bookingConversion * 100)}%
            </li>
            <li>
              Cancellation rate: {Math.round(analytics.cancellationRate * 100)}%
            </li>
          </ul>
        </section>

        <section className="space-y-3" aria-labelledby="active-gigs">
          <h2 id="active-gigs" className="font-display text-2xl font-semibold">
            Recurring gigs
          </h2>
          <ul className="space-y-2">
            {gigs.map((gig) => (
              <li key={gig.id} className="border-border rounded-lg border p-3 text-sm">
                <p className="font-medium">{describeWeeklyGig(gig)}</p>
                <p className="text-muted-foreground">
                  Needs: {gig.neededRoles.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3" aria-labelledby="gallery-count">
          <h2 id="gallery-count" className="font-display text-2xl font-semibold">
            Gallery
          </h2>
          <p className="text-muted-foreground text-sm">
            {gallery.length} media item(s). Manage via venue ecosystem gallery API.
          </p>
          <Button asChild variant="outline">
            <Link href={`/venue/${venue.handle}`}>Open public profile</Link>
          </Button>
        </section>
      </Container>
    </DashboardShell>
  );
}
