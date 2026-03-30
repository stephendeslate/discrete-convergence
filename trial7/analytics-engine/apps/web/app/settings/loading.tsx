import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading(): React.JSX.Element {
  return (
    <div role="status" aria-busy="true" className="p-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
