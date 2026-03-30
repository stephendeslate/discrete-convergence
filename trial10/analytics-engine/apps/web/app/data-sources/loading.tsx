import { Skeleton } from '@/components/ui/skeleton';

export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-10 w-48 mb-6" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
