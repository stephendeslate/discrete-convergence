'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function RegisterError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">Registration Error</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
