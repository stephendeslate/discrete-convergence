import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
