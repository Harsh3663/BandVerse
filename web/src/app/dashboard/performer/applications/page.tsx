import type { Metadata } from "next";

import {
  listPerformerApplicationContexts,
  mockMarketplaceRepositories,
  mockPerformerPersonaId,
  PerformerApplications,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "My Applications",
  description: "Track performer proposals by application status.",
  robots: { index: false, follow: false },
};

export default async function PerformerApplicationsPage() {
  const records = await listPerformerApplicationContexts(
    mockMarketplaceRepositories,
    mockPerformerPersonaId,
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-primary font-medium">Performer dashboard</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">My Applications</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Follow every proposal from submission through booking and completion.
        </p>
      </header>
      <PerformerApplications records={records} />
    </div>
  );
}
