// TRACED:WEB-SPEAKERS-PAGE — Speakers management page
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { SpeakerList } from '@/components/speaker-list';

export default function SpeakersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Speakers</h1>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton count={4} />}>
          <SpeakerList speakers={[]} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
