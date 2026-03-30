// TRACED:WEB-SESSIONS-PAGE — Sessions management page
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { SessionList } from '@/components/session-list';

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Sessions</h1>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton count={4} />}>
          <SessionList sessions={[]} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
