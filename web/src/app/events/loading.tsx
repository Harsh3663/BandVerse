import { Container } from "@/components/layout/container";
import { CardGridSkeleton, Skeleton } from "@/components/shared/content-skeletons";

export default function EventsLoading() {
  return (
    <Container className="space-y-10 py-12 sm:py-16">
      <div role="status" aria-label="Loading events">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="mt-3 h-5 w-[34rem] max-w-full" />
        <span className="sr-only">Loading events…</span>
      </div>
      <CardGridSkeleton count={6} variant="event" />
    </Container>
  );
}
