'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsError({ error, reset }: { error: Error; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        Failed to load settings
      </h2>
      <p className="text-sm text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
