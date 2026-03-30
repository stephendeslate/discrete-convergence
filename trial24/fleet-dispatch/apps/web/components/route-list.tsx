// TRACED:WEB-ROUTE-LIST
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
}

export function RouteList({ routes }: { routes: Route[] }) {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading routes...</div>;
  }

  if (error) {
    return <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>;
  }

  if (routes.length === 0) {
    return <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No routes defined yet.</p>;
  }

  return (
    <div className={cn('space-y-4')}>
      {routes.map((r) => (
        <div key={r.id} className={cn('rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
          <h3 className={cn('font-semibold dark:text-white')}>{r.name}</h3>
          <div className={cn('flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400')}>
            <span>{r.origin} → {r.destination}</span>
            <span>{r.distance} km</span>
            <span>~{r.estimatedDuration} min</span>
          </div>
        </div>
      ))}
    </div>
  );
}
