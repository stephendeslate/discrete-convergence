'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function DataSourcesError({ error, reset }: { error: Error; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="space-y-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold">
        Failed to Load Data Sources
      </h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
