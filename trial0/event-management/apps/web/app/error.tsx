// TRACED:EM-FE-007 — Error boundary with role="alert", useRef, focus management
'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
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
    <div role="alert" tabIndex={-1} ref={errorRef} className="flex flex-col items-center gap-4 py-16">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
