import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerApplicationGroups,
  OrganizerPageHeader,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Applications",
  description: "Triage artist applications for organizer events.",
  robots: { index: false, follow: false },
};

export default async function OrganizerApplicationsPage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Applications"
        description="Shortlist, accept, or reject artist proposals using local demo controls."
      />
      <OrganizerApplicationGroups
        records={data.applications.filter(({ application }) =>
          ["submitted", "shortlisted"].includes(application.status),
        )}
      />
    </div>
  );
}
