// TRACED:WEB-WIDGETS-PAGE — Widgets management page
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { WidgetList } from '@/components/widget-list';

export default function WidgetsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Widgets</h1>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton count={4} />}>
          <WidgetList widgets={[]} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
