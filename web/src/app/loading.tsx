import { Container } from "@/components/layout/container";
import { CardGridSkeleton, Skeleton } from "@/components/shared/content-skeletons";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading page" aria-busy="true">
      <div className="border-border bg-card/60 border-b">
        <Container className="space-y-4 py-14 sm:py-20">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-xl sm:h-14" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-5 w-2/3 max-w-lg" />
        </Container>
      </div>
      <Container className="space-y-7 py-10 sm:py-14">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <CardGridSkeleton count={4} />
      </Container>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
