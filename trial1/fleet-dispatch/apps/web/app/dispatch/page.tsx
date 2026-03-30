'use client';

import dynamic from 'next/dynamic';

const DispatchDashboard = dynamic(() => import('@/components/dispatch-dashboard'), {
  ssr: false,
  loading: () => (
    <div role="status" aria-busy="true" className="animate-pulse text-muted-foreground">
      Loading map...
    </div>
  ),
});

export default function DispatchPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dispatch Dashboard</h1>
      <DispatchDashboard />
    </div>
  );
}
