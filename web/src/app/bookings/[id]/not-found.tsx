import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/result-state";

export default function BookingNotFound() {
  return (
    <Container className="py-10 sm:py-14">
      <EmptyState
        title="Booking not found"
        description="Check the booking reference or return to your booking list."
        clearHref="/bookings"
      />
    </Container>
  );
}
