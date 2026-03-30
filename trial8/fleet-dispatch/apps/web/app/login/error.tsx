'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBoundaryReporter } from '@/components/error-boundary';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="flex flex-col items-center justify-center py-12">
      <ErrorBoundaryReporter error={error} />
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
