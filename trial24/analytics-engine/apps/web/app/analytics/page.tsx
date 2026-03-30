// TRACED:WEB-ANALYTICS-PAGE — Analytics overview page
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className={cn('text-2xl font-bold dark:text-white')}>Analytics</h1>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton count={3} />}>
          <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3')}>
            <div className={cn('rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
              <h3 className={cn('text-sm font-medium text-gray-500 dark:text-gray-400')}>Total Views</h3>
              <p className={cn('mt-2 text-3xl font-bold dark:text-white')}>0</p>
            </div>
            <div className={cn('rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
              <h3 className={cn('text-sm font-medium text-gray-500 dark:text-gray-400')}>Active Users</h3>
              <p className={cn('mt-2 text-3xl font-bold dark:text-white')}>0</p>
            </div>
            <div className={cn('rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
              <h3 className={cn('text-sm font-medium text-gray-500 dark:text-gray-400')}>Data Points</h3>
              <p className={cn('mt-2 text-3xl font-bold dark:text-white')}>0</p>
            </div>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
