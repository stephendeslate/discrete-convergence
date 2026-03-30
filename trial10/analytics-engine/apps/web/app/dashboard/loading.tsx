import { Skeleton } from '@/components/ui/skeleton';

// TRACED: AE-AX-001
export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
