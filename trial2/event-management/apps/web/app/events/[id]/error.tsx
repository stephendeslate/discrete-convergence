'use client';

import { useEffect, useRef } from 'react';

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
    <div role="alert" ref={errorRef} tabIndex={-1} className="space-y-4 p-4">
      <h2 className="text-lg font-semibold text-[var(--destructive)]">
        Something went wrong
      </h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]"
      >
        Try again
      </button>
    </div>
  );
}
