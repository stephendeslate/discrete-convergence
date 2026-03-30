'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function RegisterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Registration Error</h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        {error.message ?? 'Failed to process registration'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
