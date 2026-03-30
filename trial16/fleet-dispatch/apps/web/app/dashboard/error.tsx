'use client';

import { useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    errorRef.current?.focus();
  }, [error]);

  return (
    <div role="alert" ref={errorRef} tabIndex={-1} className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[var(--destructive)]">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={() => reset()} variant="outline">
        Try again
      </Button>
    </div>
  );
}
