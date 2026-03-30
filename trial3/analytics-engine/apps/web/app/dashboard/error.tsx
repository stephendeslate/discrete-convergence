// TRACED:AE-AX-002 — error boundary with role="alert", useRef, and focus management
'use client';

import { useEffect, useRef } from 'react';

export default function DashboardError({
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
    <div role="alert" ref={errorRef} tabIndex={-1} className="p-6 rounded-lg border border-[var(--destructive)] bg-[var(--card)]">
      <h2 className="text-lg font-semibold text-[var(--destructive)] mb-2">
        Something went wrong
      </h2>
      <p className="text-[var(--muted-foreground)] mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
