'use client';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DriversError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <Alert variant="destructive">
        <p>Failed to load drivers: {error.message}</p>
      </Alert>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
