import { Skeleton } from '@/components/ui/Skeleton';

export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-md space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
