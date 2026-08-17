import { CalendarDays, MapPin, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { JsonLd } from "@/components/shared/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

import { formatTime, formatWeekday, titleCase } from "../format";
import type { VenueProfile } from "../types";
import {
  MarketplaceBookingCta,
  MarketplaceMediaGallery,
  MarketplaceProfileFacts,
  MarketplaceProfileHero,
} from "./profile-modules";
import { TrustBadges, TrustPanel } from "./trust";

export function VenueCard({ venue }: { venue: VenueProfile }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{titleCase(venue.type)}</Badge>
          {venue.verified ? <Badge variant="secondary">Verified</Badge> : null}
        </div>
        <CardTitle className="font-display mt-2 text-xl">{venue.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <TrustBadges signals={venue.trustSignals} compact limit={2} />
        <p className="text-muted-foreground flex items-center gap-2">
          <MapPin className="size-4" aria-hidden />
          {venue.location.city}, {venue.location.state}
        </p>
        <p className="text-muted-foreground line-clamp-3">{venue.description}</p>
        <p className="text-sm">
          Up to {venue.capacity.standing ?? venue.capacity.seated ?? "—"} guests
        </p>
        <Button asChild className="mt-auto">
          <Link href={`/venue/${venue.handle}` as Route}>View venue</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function VenueDirectory({ venues }: { venues: readonly VenueProfile[] }) {
  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-3xl space-y-3">
        <Badge variant="secondary">Venue directory</Badge>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Find stages for live events
        </h1>
        <p className="text-muted-foreground text-lg">
          Explore illustrative venues, capacities, amenities, and recurring performance
          schedules.
        </p>
      </header>
      <section
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Venues"
      >
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </section>
    </Container>
  );
}

export function VenueDetails({ venue }: { venue: VenueProfile }) {
  return (
    <section className="space-y-5" aria-labelledby="venue-details-heading">
      <h2 id="venue-details-heading" className="font-display text-3xl font-semibold">
        Venue details
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Capacity and amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-muted-foreground text-xs">Seated</dt>
                <dd className="font-medium">{venue.capacity.seated ?? "On request"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Standing</dt>
                <dd className="font-medium">{venue.capacity.standing ?? "On request"}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              {venue.amenityIds.map((amenity) => (
                <Badge key={amenity} variant="outline">
                  {titleCase(amenity)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Programming preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {venue.preferredGenreIds.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {titleCase(genre)}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              Event types: {venue.preferredEventTypeIds.map(titleCase).join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function VenueSchedule({ venue }: { venue: VenueProfile }) {
  if (!venue.recurringSchedules.length) return null;
  return (
    <section className="space-y-5" aria-labelledby="venue-schedule-heading">
      <h2 id="venue-schedule-heading" className="font-display text-3xl font-semibold">
        Recurring schedule
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {venue.recurringSchedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="text-primary size-5" aria-hidden />
                {schedule.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                {schedule.weekdays.map(formatWeekday).join(" and ")} ·{" "}
                {formatTime(schedule.time.start)}–{formatTime(schedule.time.end)}
              </p>
              <p className="text-muted-foreground text-sm">
                Looking for{" "}
                {schedule.preferredPerformerCategoryIds.map(titleCase).join(", ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceVenueProfile({
  venue,
  enquiryHref,
}: {
  venue: VenueProfile;
  enquiryHref: Route;
}) {
  const location = `${venue.location.city}, ${venue.location.state}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EventVenue",
          name: venue.name,
          description: venue.description,
          url: `${siteConfig.url}/venue/${venue.handle}`,
          maximumAttendeeCapacity: venue.capacity.standing ?? venue.capacity.seated ?? 0,
          address: {
            "@type": "PostalAddress",
            addressLocality: venue.location.city,
            addressRegion: venue.location.state,
            addressCountry: "IN",
          },
        }}
      />
      <Container className="py-8 sm:py-12">
        <article className="space-y-12">
          <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              <MarketplaceMediaGallery media={venue.mediaGallery} priority />
              <MarketplaceProfileHero
                name={venue.name}
                headline={titleCase(venue.type)}
                description={venue.description}
                location={location}
                verified={venue.verified}
                tags={[...venue.preferredGenreIds, ...venue.amenityIds]}
                trustSignals={venue.trustSignals}
              />
            </div>
            <div className="space-y-4">
              <MarketplaceBookingCta
                title="Plan an event"
                primaryHref={enquiryHref}
                primaryLabel="Enquire about this venue"
                secondaryHref={"/venues" as Route}
              />
              <TrustPanel signals={venue.trustSignals} heading="Venue trust" />
            </div>
          </div>
          <MarketplaceProfileFacts
            facts={[
              {
                icon: <Users />,
                label: "Standing capacity",
                value: String(venue.capacity.standing ?? "On request"),
              },
              {
                icon: <Users />,
                label: "Seated capacity",
                value: String(venue.capacity.seated ?? "On request"),
              },
              {
                icon: <MapPin />,
                label: "Location",
                value: location,
              },
              {
                icon: <CalendarDays />,
                label: "Recurring programmes",
                value: String(venue.recurringSchedules.length),
              },
            ]}
          />
          <VenueDetails venue={venue} />
          <VenueSchedule venue={venue} />
        </article>
      </Container>
    </>
  );
}
