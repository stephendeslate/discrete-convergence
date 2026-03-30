'use client';

import { useRef, useEffect } from 'react';

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
  }, []);

  return (
    <div
      ref={containerRef}
      role="alert"
      tabIndex={-1}
      className="rounded-lg border border-[var(--destructive)] bg-[var(--background)] p-6 text-center"
    >
      <h2 className="text-lg font-semibold text-[var(--destructive)]">Something went wrong</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
