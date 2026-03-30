import { Skeleton } from '@/components/ui/skeleton';

// TRACED:AE-FE-002
export default function DashboardLoading(): React.JSX.Element {
  return (
    <div role="status" aria-busy="true" className="p-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
