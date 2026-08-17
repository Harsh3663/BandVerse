import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/shared/content-skeletons";

export default function VenueProfileLoading() {
  return (
    <div role="status" aria-label="Loading venue profile">
      <Container className="grid gap-8 py-8 sm:py-12 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
        <span className="sr-only">Loading venue profile…</span>
      </Container>
    </div>
  );
}
