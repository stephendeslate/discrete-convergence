'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function RegisterError({ error, reset }: { error: Error; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, [error]);
  return (
    <div role="alert" tabIndex={-1} ref={ref} className="flex flex-col items-center gap-4 py-16">
      <h2 className="text-2xl font-bold">Registration Error</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
