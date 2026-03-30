'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function RegisterError({ error, reset }: { error: Error; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold">
          Registration Error
        </h2>
        <p className="text-[var(--muted-foreground)]">{error.message}</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
