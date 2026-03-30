import { Skeleton } from '@/components/ui/skeleton';

export default function DispatchesLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-40" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
