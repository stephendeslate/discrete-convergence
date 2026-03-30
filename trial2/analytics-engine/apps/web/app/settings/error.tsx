'use client';

import { useEffect, useRef } from 'react';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div ref={ref} role="alert" tabIndex={-1} className="rounded-lg border border-[var(--destructive)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold text-[var(--destructive)]">Settings Error</h2>
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
