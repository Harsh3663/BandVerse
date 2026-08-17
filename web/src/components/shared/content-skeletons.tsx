import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-md", className)}
      aria-hidden="true"
    />
  );
}

export function PerformerCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("border-border bg-card overflow-hidden rounded-lg border", className)}
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="border-border flex justify-between border-t p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function EventCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("border-border bg-card overflow-hidden rounded-lg border", className)}
      aria-hidden="true"
    >
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

interface CardGridSkeletonProps {
  count?: number;
  variant?: "performer" | "event";
  className?: string;
}

export function CardGridSkeleton({
  count = 6,
  variant = "performer",
  className,
}: CardGridSkeletonProps) {
  const CardSkeleton = variant === "event" ? EventCardSkeleton : PerformerCardSkeleton;

  return (
    <div role="status" aria-label="Loading results">
      <div
        className={cn(
          "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className,
        )}
      >
        {Array.from({ length: count }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <span className="sr-only">Loading results…</span>
    </div>
  );
}
