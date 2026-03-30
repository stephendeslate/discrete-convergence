import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="flex justify-center py-12">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
