import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/shared/content-skeletons";

export default function BookingsLoading() {
  return (
    <Container className="space-y-5 py-10 sm:py-14" aria-label="Loading bookings">
      <Skeleton className="h-12 w-2/3" />
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </Container>
  );
}
