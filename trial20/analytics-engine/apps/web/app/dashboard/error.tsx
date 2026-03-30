'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// TRACED: AE-EDGE-012 — Error boundaries catch rendering errors and provide recovery button
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="space-y-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold">
        Failed to Load Dashboards
      </h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
