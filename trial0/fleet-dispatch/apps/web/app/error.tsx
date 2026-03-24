'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [error]);

  return (
    <div ref={ref} role="alert" tabIndex={-1} className="space-y-4 py-12 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
