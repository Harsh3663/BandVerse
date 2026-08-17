import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import {
  ArtistApplicationForm,
  OpportunityDetails,
  eventTypes,
  mockMarketplaceRepositories,
} from "@/modules/marketplace";

interface OpportunityPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OpportunityPageProps): Promise<Metadata> {
  const event = await mockMarketplaceRepositories.events.getById((await params).id);
  return event
    ? {
        title: event.title,
        description: event.description ?? "Performance opportunity details.",
      }
    : { title: "Opportunity not found" };
}

export default async function OpportunityPage({ params }: OpportunityPageProps) {
  const event = await mockMarketplaceRepositories.events.getById((await params).id);
  if (!event || event.status !== "published") notFound();
  const eventType = eventTypes.find((item) => item.id === event.eventTypeId);
  if (!eventType) notFound();
  const performers = await mockMarketplaceRepositories.performers.list();
  const performer =
    performers.find((item) =>
      item.categoryIds.some((category) =>
        eventType.performerCategoryIds.includes(category),
      ),
    ) ?? performers[0];

  return (
    <Container className="grid items-start gap-8 py-10 sm:py-14 lg:grid-cols-[1.2fr_0.8fr]">
      <OpportunityDetails event={event} eventType={eventType} />
      {performer ? (
        <ArtistApplicationForm eventId={event.id} performer={performer} />
      ) : null}
    </Container>
  );
}
