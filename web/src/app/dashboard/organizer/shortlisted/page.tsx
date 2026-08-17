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
  title: "Shortlisted Artists",
  description: "Review shortlisted artists and make final organizer decisions.",
  robots: { index: false, follow: false },
};

export default async function OrganizerShortlistedPage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Shortlisted Artists"
        description="Compare shortlisted proposals and accept or reject them with local demo controls."
      />
      <OrganizerApplicationGroups
        records={data.applications.filter(
          ({ application }) => application.status === "shortlisted",
        )}
      />
    </div>
  );
}
