'use client';

import { useRef, useEffect } from 'react';
import { Button } from './ui/button';

// TRACED:EM-FE-007
export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    // Report error to backend
    fetch('/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message }),
    }).catch(() => {
      // Silently fail error reporting
    });
  }, [error]);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="p-8 text-center">
      <h2 className="text-2xl font-bold text-[var(--destructive)] mb-4">
        Something went wrong
      </h2>
      <p className="mb-4">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
