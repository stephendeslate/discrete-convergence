import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
