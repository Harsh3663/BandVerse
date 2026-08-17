import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MessagingInboxPanel } from "@/features/messaging/messaging-panel";
import {
  listPerformerApplicationContexts,
  mockApplications,
  mockBookings,
  mockMarketplaceRepositories,
  mockPerformerPersonaId,
  PerformerDashboardOverview,
  resolvePerformerAnalytics,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Performer dashboard",
  description: "Review performer application activity and recent event updates.",
  robots: { index: false, follow: false },
};

export default async function PerformerDashboardPage() {
  const [performer, records] = await Promise.all([
    mockMarketplaceRepositories.performers.getById(mockPerformerPersonaId),
    listPerformerApplicationContexts(mockMarketplaceRepositories, mockPerformerPersonaId),
  ]);
  if (!performer) notFound();

  const analytics = resolvePerformerAnalytics(performer, mockApplications, mockBookings);

  return (
    <div className="space-y-10">
      <PerformerDashboardOverview
        performer={performer}
        records={records}
        analytics={analytics}
      />
      <MessagingInboxPanel title="Messages" userId={mockPerformerPersonaId} />
    </div>
  );
}
