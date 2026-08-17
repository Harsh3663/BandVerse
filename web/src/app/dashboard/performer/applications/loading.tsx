import { Skeleton } from "@/components/shared/content-skeletons";

export default function PerformerApplicationsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading performer applications" role="status">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}
