'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsError({ error, reset }: { error: Error; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, [error]);

  return (
    <div ref={ref} role="alert" tabIndex={-1} className="space-y-4 py-12 text-center">
      <h2 className="text-2xl font-bold">Failed to load settings</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
