import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import {
  MarketplaceVenueProfile,
  mockMarketplaceRepositories,
  mockVenueProfiles,
} from "@/modules/marketplace";

interface VenuePageProps {
  params: Promise<{ handle: string }>;
}

export const generateStaticParams = () =>
  mockVenueProfiles.map(({ handle }) => ({ handle }));

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const venue = await mockMarketplaceRepositories.venues.getByHandle(
    (await params).handle,
  );
  if (!venue) return { title: "Venue not found" };
  const path = `/venue/${venue.handle}`;
  return {
    title: `${venue.name} | Venue`,
    description: `${venue.name} in ${venue.location.city}. View capacity, amenities, and performance schedules.`,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: venue.name,
      description: venue.description,
    },
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const venue = await mockMarketplaceRepositories.venues.getByHandle(
    (await params).handle,
  );
  if (!venue) notFound();

  const enquiry = new URLSearchParams({
    intent: "venue-enquiry",
    venue: venue.name,
    profile: `/venue/${venue.handle}`,
  });

  return (
    <MarketplaceVenueProfile
      venue={venue}
      enquiryHref={`/contact?${enquiry.toString()}` as Route}
    />
  );
}
