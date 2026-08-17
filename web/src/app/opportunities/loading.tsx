import { Container } from "@/components/layout/container";
import { CardGridSkeleton, Skeleton } from "@/components/shared/content-skeletons";

export default function OpportunitiesLoading() {
  return (
    <Container className="space-y-8 py-10 sm:py-14" aria-label="Loading opportunities">
      <Skeleton className="h-12 w-2/3" />
      <CardGridSkeleton count={3} variant="event" className="lg:grid-cols-3" />
    </Container>
  );
}
