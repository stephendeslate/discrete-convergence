'use client';
// TRACED: FD-FE-003

import { useEffect, useRef } from 'react';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="max-w-2xl mx-auto p-6">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-red-600 mb-4 outline-none">
        Dashboard Error
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Try again
      </button>
    </div>
  );
}
