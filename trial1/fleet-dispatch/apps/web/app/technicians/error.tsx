'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function TechniciansError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="p-6">
      <h2 ref={headingRef} tabIndex={-1} className="mb-4 text-xl font-semibold">
        Technicians Error
      </h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
