import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading(): React.JSX.Element {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
