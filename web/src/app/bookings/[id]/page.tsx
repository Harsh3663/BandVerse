import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getBackendContainer } from "@/backend/infrastructure/container";
import { BookingMessagingPanel } from "@/features/messaging/messaging-panel";
import { BookingLifecycle, mockMarketplaceRepositories } from "@/modules/marketplace";

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const booking = await mockMarketplaceRepositories.bookings.getById((await params).id);
  return {
    title: booking ? `Booking ${booking.id}` : "Booking not found",
    robots: { index: false, follow: false },
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const booking = await mockMarketplaceRepositories.bookings.getById((await params).id);
  if (!booking) notFound();

  const [event, performer, payments, threads, calendar] = await Promise.all([
    mockMarketplaceRepositories.events.getById(booking.eventId),
    mockMarketplaceRepositories.performers.getById(booking.performerId),
    mockMarketplaceRepositories.payments.list(),
    mockMarketplaceRepositories.chats.list(),
    mockMarketplaceRepositories.calendar.list(),
  ]);
  if (!event || !performer) notFound();

  const messaging = getBackendContainer().messaging;
  let thread = threads.find((item) => item.bookingId === booking.id);
  try {
    let conversation = await messaging.getByBooking(booking.id);
    if (!conversation) {
      conversation = await messaging.createConversation({
        organizerId: booking.hostId,
        performerId: booking.performerId,
        bookingId: booking.id,
        eventId: booking.eventId,
        actorUserId: booking.hostId,
      });
    }
    thread = await messaging.toChatThread(conversation.id);
  } catch {
    // Keep marketplace mock thread fallback if messaging bootstrap fails.
  }

  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <header className="space-y-3">
        <p className="text-primary font-medium">Booking lifecycle</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{event.title}</h1>
      </header>
      <BookingLifecycle
        initialBooking={booking}
        event={event}
        performer={performer}
        payment={payments.find((item) => item.bookingId === booking.id)}
        thread={thread}
        calendarEntries={calendar.filter(
          (item) => item.ownerType === "performer" && item.ownerId === performer.id,
        )}
      />
      <BookingMessagingPanel
        bookingId={booking.id}
        organizerId={booking.hostId}
        performerId={booking.performerId}
      />
    </Container>
  );
}
