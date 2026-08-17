import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  listOrganizerConfirmed,
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerConfirmedArtists,
  OrganizerPageHeader,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Confirmed Artists",
  description: "Review accepted applications and active confirmed bookings.",
  robots: { index: false, follow: false },
};

export default async function OrganizerConfirmedPage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Confirmed Artists"
        description="Accepted artists and active bookings for upcoming events."
      />
      <OrganizerConfirmedArtists records={listOrganizerConfirmed(data)} />
    </div>
  );
}
