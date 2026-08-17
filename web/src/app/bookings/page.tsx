import type { Metadata, Route } from "next";

import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/result-state";
import { BookingSummaryCard, mockMarketplaceRepositories } from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Review booking requests and lifecycle status.",
  robots: { index: false, follow: false },
};

export default async function BookingsPage() {
  const [bookings, events, performers] = await Promise.all([
    mockMarketplaceRepositories.bookings.list(),
    mockMarketplaceRepositories.events.list(),
    mockMarketplaceRepositories.performers.list(),
  ]);

  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Bookings</h1>
        <p className="text-muted-foreground">
          Track confirmation, advance, completion, and review status.
        </p>
      </header>
      {bookings.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {bookings.map((booking) => (
            <BookingSummaryCard
              key={booking.id}
              booking={booking}
              event={events.find((item) => item.id === booking.eventId)}
              performer={performers.find((item) => item.id === booking.performerId)}
              href={`/bookings/${booking.id}` as Route}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No bookings yet"
          description="Confirmed requests will appear here."
        />
      )}
    </Container>
  );
}
