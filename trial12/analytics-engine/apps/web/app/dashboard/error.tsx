'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

// TRACED: AE-AX-002
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="space-y-4">
      <Alert variant="destructive">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-[var(--muted-foreground)]">{error.message}</p>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
