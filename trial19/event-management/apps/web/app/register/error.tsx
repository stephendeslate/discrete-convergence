'use client';

import { useEffect, useRef } from 'react';

export default function RegisterError({ error, reset }: { error: Error; reset: () => void }) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    errorRef.current?.focus();
  }, []);

  return (
    <div role="alert" ref={errorRef} tabIndex={-1} className="max-w-md mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--destructive)] mb-4">Registration Error</h1>
      <p className="mb-4">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded">
        Try again
      </button>
    </div>
  );
}
