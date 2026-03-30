'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
    <div role="alert" ref={ref} tabIndex={-1} className="flex min-h-[60vh] items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Registration Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <Button onClick={reset} variant="outline" className="mt-4">
          Try Again
        </Button>
      </Alert>
    </div>
  );
}
