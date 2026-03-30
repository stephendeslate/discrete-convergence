'use client';

import { useRef, useEffect } from 'react';

export default function RegisterError({
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
    <div ref={errorRef} role="alert" tabIndex={-1} className="mx-auto max-w-md p-6">
      <h2 className="text-xl font-bold text-[var(--destructive)] mb-2">Registration Error</h2>
      <p className="text-[var(--muted-foreground)] mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]"
      >
        Try Again
      </button>
    </div>
  );
}
