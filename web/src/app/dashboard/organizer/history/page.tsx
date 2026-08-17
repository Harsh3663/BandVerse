import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  listOrganizerBookingHistory,
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerBookingHistory,
  OrganizerPageHeader,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Booking History",
  description: "Review completed and cancelled organizer bookings.",
  robots: { index: false, follow: false },
};

export default async function OrganizerHistoryPage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Booking History"
        description="Completed and cancelled bookings retained for venue reference."
      />
      <OrganizerBookingHistory records={listOrganizerBookingHistory(data)} />
    </div>
  );
}
