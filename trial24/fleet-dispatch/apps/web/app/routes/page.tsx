// TRACED:WEB-ROUTES-PAGE — Routes management page
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { RouteList } from '@/components/route-list';

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Routes</h1>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton count={4} />}>
          <RouteList routes={[]} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
