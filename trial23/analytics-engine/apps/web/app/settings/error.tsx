'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">{error.message}</AlertDescription>
        <Button variant="outline" onClick={reset} className="mt-4">
          Try again
        </Button>
      </Alert>
    </div>
  );
}
