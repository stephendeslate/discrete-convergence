import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="flex justify-center py-12">
      <Skeleton className="h-72 w-full max-w-md rounded-lg" />
    </div>
  );
}
