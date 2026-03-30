'use client';

import { useEffect, useRef } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, [error]);

  return (
    <div
      ref={containerRef}
      role="alert"
      tabIndex={-1}
      className="p-6 rounded-lg border border-[var(--destructive)] bg-[var(--card)]"
    >
      <h2 className="text-lg font-semibold text-[var(--destructive)]">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)] mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
