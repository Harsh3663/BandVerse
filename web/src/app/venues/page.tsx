import type { Metadata } from "next";

import { VenueDirectory, mockMarketplaceRepositories } from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Venue directory",
  description:
    "Explore representative live-music venues, capacities, amenities, and schedules.",
  alternates: { canonical: "/venues" },
};

export default async function VenuesPage() {
  const venues = await mockMarketplaceRepositories.venues.list();
  return <VenueDirectory venues={venues} />;
}
