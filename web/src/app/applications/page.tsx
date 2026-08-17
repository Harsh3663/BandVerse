import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/result-state";
import { ApplicationInbox, mockMarketplaceRepositories } from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Application inbox",
  description: "Venue-side demo for triaging performer applications.",
  robots: { index: false, follow: false },
};

export default async function ApplicationsPage() {
  const [applications, performers] = await Promise.all([
    mockMarketplaceRepositories.applications.list(),
    mockMarketplaceRepositories.performers.list(),
  ]);

  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Application inbox
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Shortlist, accept, or reject proposals. Controls only appear when the domain
          state machine permits the transition.
        </p>
      </header>
      {applications.length ? (
        <ApplicationInbox initialApplications={applications} performers={performers} />
      ) : (
        <EmptyState
          title="No applications"
          description="New performer proposals will appear here."
        />
      )}
    </Container>
  );
}
