'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function RegistrationsError({
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
    <Alert variant="destructive" role="alert">
      <AlertTitle ref={headingRef} tabIndex={-1}>Error Loading Registrations</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      <Button variant="outline" onClick={reset} className="mt-4">Try again</Button>
    </Alert>
  );
}
