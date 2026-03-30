import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-10 w-32 mb-6" />
      <Skeleton className="h-48 w-full max-w-lg rounded-lg" />
    </div>
  );
}
