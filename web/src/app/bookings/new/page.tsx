import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import {
  BookingWizard,
  eventTypes,
  mockMarketplaceRepositories,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "New booking request",
  description: "Send a structured booking request to a performer.",
  robots: { index: false, follow: false },
};

interface NewBookingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewBookingPage({ searchParams }: NewBookingPageProps) {
  const query = await searchParams;
  const performerId = first(query.performer);
  const performers = await mockMarketplaceRepositories.performers.list();
  const performer = performerId
    ? await mockMarketplaceRepositories.performers.getById(performerId)
    : performers[0];
  if (!performer) notFound();
  const [venues, calendarEntries] = await Promise.all([
    mockMarketplaceRepositories.venues.list(),
    mockMarketplaceRepositories.calendar.listByOwner("performer", performer.id),
  ]);

  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          New booking request
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Share the event context needed for an accurate confirmation and quote.
        </p>
      </header>
      <BookingWizard
        performer={performer}
        eventTypes={eventTypes}
        venues={venues}
        calendarEntries={calendarEntries}
        initialEventType={first(query.eventType) ?? first(query.event)}
        initialDate={first(query.date)}
      />
    </Container>
  );
}
