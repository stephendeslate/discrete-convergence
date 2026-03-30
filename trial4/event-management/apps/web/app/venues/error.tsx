'use client';

import { useEffect, useRef } from 'react';

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  return (
    <div role="alert" ref={containerRef} tabIndex={-1} className="mx-auto max-w-lg py-12 text-center">
      <h2 className="text-xl font-semibold text-[var(--destructive)]">Something went wrong</h2>
      <p className="mt-2 text-[var(--muted-foreground)]">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]"
      >
        Try again
      </button>
    </div>
  );
}
