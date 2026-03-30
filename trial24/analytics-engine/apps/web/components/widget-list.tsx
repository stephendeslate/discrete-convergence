// TRACED:WEB-WIDGET-LIST — Widget list component
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Widget {
  id: string;
  title: string;
  type: string;
  dashboardId: string;
  createdAt: string;
}

export function WidgetList({ widgets }: { widgets: Widget[] }) {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading widgets...</div>;
  }

  if (error) {
    return <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>;
  }

  if (widgets.length === 0) {
    return <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No widgets yet.</p>;
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
      {widgets.map((w) => (
        <div key={w.id} className={cn('rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
          <h3 className={cn('font-semibold dark:text-white')}>{w.title}</h3>
          <p className={cn('text-sm text-gray-600 mt-1 dark:text-gray-400')}>Type: {w.type}</p>
          <span className={cn('text-xs text-gray-500 dark:text-gray-400')}>{new Date(w.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}
