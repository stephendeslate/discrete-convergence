'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

// TRACED:AE-FE-006
export function ErrorBoundaryFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // POST error to backend
    void fetch('/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        url: typeof window !== 'undefined' ? window.location.href : '',
      }),
    });
  }, [error]);

  return (
    <div role="alert" className="p-8">
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--destructive)' }}>
        Something went wrong
      </h2>
      <p className="mb-4">{error.message}</p>
      <Button onClick={onReset}>Try Again</Button>
    </div>
  );
}
