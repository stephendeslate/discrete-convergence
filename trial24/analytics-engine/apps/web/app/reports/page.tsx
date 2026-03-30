// TRACED:WEB-REPORTS-PAGE — Reports management page
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className={cn('text-2xl font-bold dark:text-white')}>Reports</h1>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton count={3} />}>
          <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No reports generated yet. Create a dashboard with widgets first.</p>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
