import { Skeleton } from '@/components/ui/skeleton';

export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
