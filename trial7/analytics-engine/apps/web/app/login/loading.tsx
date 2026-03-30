import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading(): React.JSX.Element {
  return (
    <div role="status" aria-busy="true" className="flex min-h-screen items-center justify-center">
      <Skeleton className="h-64 w-96" />
    </div>
  );
}
