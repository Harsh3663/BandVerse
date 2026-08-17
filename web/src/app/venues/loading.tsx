import { Container } from "@/components/layout/container";
import { CardGridSkeleton, Skeleton } from "@/components/shared/content-skeletons";

export default function VenuesLoading() {
  return (
    <div role="status" aria-label="Loading venues">
      <Container className="space-y-8 py-10 sm:py-14">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <CardGridSkeleton count={6} />
        <span className="sr-only">Loading venues…</span>
      </Container>
    </div>
  );
}
