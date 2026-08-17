import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerAnalyticsPanel,
  resolveOrganizerAnalytics,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Organizer analytics",
  description: "Review venue programme metrics, artist pipeline, and budget usage.",
  robots: { index: false, follow: false },
};

export default async function OrganizerAnalyticsPage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  const analytics = resolveOrganizerAnalytics(data);
  return <OrganizerAnalyticsPanel analytics={analytics} />;
}
