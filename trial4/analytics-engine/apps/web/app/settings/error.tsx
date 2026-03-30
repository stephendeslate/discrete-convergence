'use client';

import { useEffect, useRef } from 'react';

export default function SettingsError({
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
    <div
      ref={errorRef}
      role="alert"
      tabIndex={-1}
      className="max-w-2xl p-6 border border-[var(--destructive)] rounded-lg"
    >
      <h2 className="text-lg font-bold text-[var(--destructive)] mb-2">Settings Error</h2>
      <p className="text-[var(--muted-foreground)] mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg"
      >
        Retry
      </button>
    </div>
  );
}
