import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/shared/content-skeletons";

export default function ApplicationsLoading() {
  return (
    <Container className="space-y-5 py-10 sm:py-14" aria-label="Loading applications">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-lg" />
    </Container>
  );
}
