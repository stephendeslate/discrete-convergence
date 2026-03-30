'use client';

import { useEffect, useRef } from 'react';

// TRACED: AE-FE-003
export default function DashboardError({
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
    <div role="alert">
      <h2 ref={headingRef} tabIndex={-1}>
        Dashboard Error
      </h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
