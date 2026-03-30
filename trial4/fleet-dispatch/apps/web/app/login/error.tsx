'use client';
import { useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';

export default function ErrorBoundary({
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
    <div role="alert" ref={ref} tabIndex={-1} className="p-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--destructive)' }}>
        Something went wrong
      </h2>
      <p className="mt-2">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  );
}
