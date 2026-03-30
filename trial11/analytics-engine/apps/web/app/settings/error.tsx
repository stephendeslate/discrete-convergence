'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SettingsError({
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
    <div role="alert" ref={ref} tabIndex={-1} className="space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Settings Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <Button onClick={reset} variant="outline" className="mt-4">
          Retry
        </Button>
      </Alert>
    </div>
  );
}
