import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import type { ProfileRouteKind } from "@/data/performer-profiles";
import {
  MarketplacePerformerProfile,
  mockMarketplaceRepositories,
  mockPerformerProfiles,
  type PerformerProfile,
} from "@/modules/marketplace";

export interface ProfileRouteProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function profileStaticParams(routeKind: ProfileRouteKind) {
  return mockPerformerProfiles
    .filter((profile) => routeKindFor(profile) === routeKind)
    .map(({ handle }) => ({ handle }));
}

export async function profileMetadata(
  routeKind: ProfileRouteKind,
  props: Pick<ProfileRouteProps, "params">,
): Promise<Metadata> {
  const handle = (await props.params).handle;
  const profile = getProfile(routeKind, handle);
  const path = `/${routeKind}/${handle}`;
  const image = profile?.coverImage;
  let imageUrl: string | undefined;
  if (image) {
    imageUrl = typeof image.source === "string" ? image.source : image.source.src;
  }
  return profile
    ? {
        title: `${profile.displayName} | ${profile.headline}`,
        description: `${profile.displayName} in ${profile.travel.baseLocation.city}. View representative profile details and send a booking enquiry.`,
        alternates: { canonical: path },
        openGraph: {
          type: "profile",
          url: path,
          title: profile.displayName,
          description: profile.biography,
          images: imageUrl
            ? [{ url: imageUrl, alt: image?.alt ?? profile.displayName }]
            : [],
        },
      }
    : { title: "Performer not found" };
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function bookingHref(
  profile: PerformerProfile,
  routeKind: ProfileRouteKind,
  searchParams: Record<string, string | string[] | undefined>,
): Route {
  const query = new URLSearchParams({
    performer: profile.id,
    profile: `/${routeKind}/${profile.handle}`,
  });
  const eventType = first(searchParams.eventType) || first(searchParams.event);
  const date = first(searchParams.date);
  if (eventType) query.set("eventType", eventType);
  if (date) query.set("date", date);
  return `/bookings/new?${query.toString()}` as Route;
}

export async function PerformerProfilePage({
  routeKind,
  params,
  searchParams,
}: ProfileRouteProps & { routeKind: ProfileRouteKind }) {
  const profile = getProfile(routeKind, (await params).handle);
  if (!profile) notFound();

  const query = await searchParams;
  const eventType = first(query.eventType) || first(query.event);
  const date = first(query.date);
  const city = first(query.city);
  const budget = Number(first(query.budget));
  const guests = Number(first(query.guests));
  const eventContext =
    eventType && city && Number.isFinite(budget) && Number.isFinite(guests)
      ? {
          eventTypeId: eventType,
          budget,
          guests,
          city,
          eventDate: date || undefined,
        }
      : undefined;
  const [reviews, calendarEntries] = await Promise.all([
    mockMarketplaceRepositories.reviews.listByPerformer(profile.id),
    mockMarketplaceRepositories.calendar.listByOwner("performer", profile.id),
  ]);

  return (
    <MarketplacePerformerProfile
      profile={profile}
      reviews={reviews}
      calendarEntries={calendarEntries}
      canonicalPath={`/${routeKind}/${profile.handle}`}
      bookingHref={bookingHref(profile, routeKind, query)}
      bookingIntent={{ eventType: eventType || undefined, date: date || undefined }}
      eventContext={eventContext}
    />
  );
}

function routeKindFor(profile: PerformerProfile): ProfileRouteKind {
  if (profile.kind === "solo" || profile.kind === "dj") return "artist";
  if (profile.kind === "traditional-group") return "group";
  return "band";
}

function getProfile(routeKind: ProfileRouteKind, handle: string) {
  return mockPerformerProfiles.find(
    (profile) => profile.handle === handle && routeKindFor(profile) === routeKind,
  );
}
