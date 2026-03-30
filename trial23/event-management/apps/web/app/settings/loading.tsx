import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
