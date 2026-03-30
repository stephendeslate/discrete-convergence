'use client';

import { useEffect, useRef } from 'react';

export default function RoutesError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="max-w-7xl mx-auto py-6">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-red-600 mb-4 outline-none"
      >
        Routes Error
      </h2>
      <p className="mb-4">Failed to load routes. Please try again.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
