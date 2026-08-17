import type { Metadata, Route } from "next";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/result-state";
import {
  OpportunityCard,
  eventTypes,
  mockMarketplaceRepositories,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Performance opportunities",
  description: "Review published live-performance opportunities and submit a proposal.",
  alternates: { canonical: "/opportunities" },
};

export default async function OpportunitiesPage() {
  const events = (await mockMarketplaceRepositories.events.list()).filter(
    (event) => event.status === "published",
  );

  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Performance opportunities
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Review event requirements and submit a typed proposal to the host or venue.
        </p>
      </header>
      {events.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const eventType = eventTypes.find((item) => item.id === event.eventTypeId);
            return eventType ? (
              <OpportunityCard
                key={event.id}
                event={event}
                eventType={eventType}
                href={`/opportunities/${event.id}` as Route}
              />
            ) : null;
          })}
        </div>
      ) : (
        <EmptyState
          title="No open opportunities"
          description="Published event opportunities will appear here."
        />
      )}
    </Container>
  );
}
