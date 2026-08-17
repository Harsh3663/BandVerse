import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerVenueProfile,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Venue Profile",
  description: "Review the organizer venue profile and programming details.",
  robots: { index: false, follow: false },
};

export default async function OrganizerVenuePage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return <OrganizerVenueProfile venue={data.venue} />;
}
