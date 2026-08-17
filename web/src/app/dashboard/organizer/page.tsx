import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MessagingInboxPanel } from "@/features/messaging/messaging-panel";
import {
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerDashboardOverview,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Organizer dashboard",
  description: "Review venue events, artist applications, and booking activity.",
  robots: { index: false, follow: false },
};

export default async function OrganizerDashboardPage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-10">
      <OrganizerDashboardOverview data={data} />
      <MessagingInboxPanel title="Messages" userId={mockOrganizerPersona.hostId} />
    </div>
  );
}
