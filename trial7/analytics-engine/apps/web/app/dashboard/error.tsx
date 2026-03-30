'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// TRACED:AE-FE-003
export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="p-8">
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--destructive)' }}>
        Dashboard Error
      </h2>
      <p className="mb-4">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
