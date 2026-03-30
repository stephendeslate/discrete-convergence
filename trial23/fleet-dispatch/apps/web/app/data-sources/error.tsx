'use client';

import { useEffect, useRef } from 'react';

export default function DataSourcesError({ error, reset }: { error: Error; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div ref={ref} role="alert" tabIndex={-1} className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-lg font-semibold text-red-800">Error loading data sources</h2>
      <p className="text-red-600 mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Try again</button>
    </div>
  );
}
