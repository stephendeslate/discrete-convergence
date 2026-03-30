// TRACED:WEB-COMP-WIDGETLIST — Widget list component
'use client';

import { useState } from 'react';
import { deleteWidget } from '../lib/actions';
import { cn } from '../lib/utils';

interface Widget {
  id: string;
  title: string;
  type: string;
  dashboardId?: string;
}

interface WidgetListProps {
  widgets: Widget[];
  token: string;
}

export function WidgetList({ widgets: initial, token }: WidgetListProps) {
  const [widgets, setWidgets] = useState(initial);

  async function handleDelete(id: string) {
    if (!confirm('Delete this widget?')) return;
    const result = await deleteWidget(id, token);
    if (result.success) {
      setWidgets((prev) => prev.filter((w) => w.id !== id));
    }
  }

  if (widgets.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 mt-4">No widgets yet. Create one above.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {widgets.map((w) => (
        <div key={w.id} className={cn('bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700')}>
          <h3 className="text-lg font-semibold">{w.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Type: {w.type}</p>
          <div className="mt-4">
            <button onClick={() => handleDelete(w.id)} className="text-sm text-red-600 hover:underline">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
