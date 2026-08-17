import { Container } from "@/components/layout/container";
import { CardGridSkeleton, Skeleton } from "@/components/shared/content-skeletons";

export default function CategoriesLoading() {
  return (
    <Container className="space-y-10 py-12 sm:py-16">
      <div role="status" aria-label="Loading categories">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="mt-3 h-5 w-[36rem] max-w-full" />
        <span className="sr-only">Loading categories…</span>
      </div>
      <CardGridSkeleton count={6} />
    </Container>
  );
}
