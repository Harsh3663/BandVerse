import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  mockApplications,
  mockBookings,
  mockMarketplaceRepositories,
  mockPerformerPersonaId,
  PerformerAnalyticsPanel,
  resolvePerformerAnalytics,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Performer analytics",
  description: "Review bookings, revenue, profile interest, and completion metrics.",
  robots: { index: false, follow: false },
};

export default async function PerformerAnalyticsPage() {
  const performer =
    await mockMarketplaceRepositories.performers.getById(mockPerformerPersonaId);
  if (!performer) notFound();

  const analytics = resolvePerformerAnalytics(performer, mockApplications, mockBookings);
  return <PerformerAnalyticsPanel analytics={analytics} />;
}
