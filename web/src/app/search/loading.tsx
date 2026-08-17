import { Container } from "@/components/layout/container";
import { CardGridSkeleton, Skeleton } from "@/components/shared/content-skeletons";

export default function SearchLoading() {
  return (
    <Container className="space-y-8 py-12 sm:py-16">
      <div role="status" aria-label="Loading search">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="mt-3 h-5 w-[32rem] max-w-full" />
        <Skeleton className="mt-10 h-32 w-full" />
        <span className="sr-only">Loading search results…</span>
      </div>
      <CardGridSkeleton count={8} />
    </Container>
  );
}
