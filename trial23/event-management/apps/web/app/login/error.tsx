'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Alert variant="destructive" role="alert" className="max-w-md">
        <AlertTitle ref={headingRef} tabIndex={-1}>Login Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <Button variant="outline" onClick={reset} className="mt-4">
          Try again
        </Button>
      </Alert>
    </div>
  );
}
