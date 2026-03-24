// TRACED:AE-FE-007 — Error boundary with role="alert", useRef, focus management
'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    errorRef.current?.focus();
  }, []);

  return (
    <div
      role="alert"
      ref={errorRef}
      tabIndex={-1}
      className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8"
    >
      <h2 className="text-2xl font-bold" style={{ color: 'var(--destructive)' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--muted-foreground)' }}>
        {error.message}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
