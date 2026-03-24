import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
      <span className="sr-only">Loading settings...</span>
    </div>
  );
}
