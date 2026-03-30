import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex justify-center py-12">
      <Skeleton className="h-64 w-full max-w-md rounded-lg" />
    </div>
  );
}
