'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="p-8">
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--destructive)' }}>
        Settings Error
      </h2>
      <p className="mb-4">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
