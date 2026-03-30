'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// TRACED: AE-FE-008
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 py-16">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        Something went wrong
      </h2>
      <p className="text-sm text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
