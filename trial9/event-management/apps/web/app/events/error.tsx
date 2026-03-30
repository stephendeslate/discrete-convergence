'use client';

import { useEffect, useRef } from 'react';

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [error]);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="rounded-md border border-[var(--destructive)] p-4">
      <h2 className="text-lg font-semibold text-[var(--destructive)]">Events Error</h2>
      <p className="mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)]">Retry</button>
    </div>
  );
}
