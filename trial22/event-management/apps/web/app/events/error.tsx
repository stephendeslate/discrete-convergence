'use client';

import { useEffect, useRef } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div ref={ref} role="alert" tabIndex={-1} className="p-4 border border-[var(--destructive)] rounded">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <button onClick={reset} className="mt-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded">
        Try again
      </button>
    </div>
  );
}
