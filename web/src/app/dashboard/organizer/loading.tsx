import { Skeleton } from "@/components/shared/content-skeletons";

export default function OrganizerDashboardLoading() {
  return (
    <div className="space-y-8" aria-label="Loading organizer dashboard" role="status">
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <span className="sr-only">Loading organizer dashboard…</span>
    </div>
  );
}
