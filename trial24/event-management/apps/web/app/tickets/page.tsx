// TRACED:WEB-TICKETS-PAGE — Tickets management page
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';
import { TicketList } from '@/components/ticket-list';

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Tickets</h1>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton count={4} />}>
          <TicketList tickets={[]} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
