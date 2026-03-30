// TRACED:WEB-CREATE-WIDGET-FORM — Form to create a new widget
'use client';

import { useState } from 'react';
import { createWidgetAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

export function CreateWidgetForm({ dashboardId }: { dashboardId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;

    if (!title) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    try {
      await createWidgetAction(title, type, dashboardId);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create widget');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('rounded-lg border bg-white p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700')}>
      <h3 className={cn('font-semibold dark:text-white')}>Add Widget</h3>
      {error && <div role="alert" className={cn('rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>}
      {loading && <div role="status" aria-busy="true">Creating widget...</div>}
      <div>
        <label htmlFor="widget-title" className={cn('block text-sm font-medium dark:text-gray-200')}>Title</label>
        <input id="widget-title" name="title" required className={cn('mt-1 w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
      </div>
      <div>
        <label htmlFor="widget-type" className={cn('block text-sm font-medium dark:text-gray-200')}>Type</label>
        <select id="widget-type" name="type" required className={cn('mt-1 w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white')}>
          <option value="bar-chart">Bar Chart</option>
          <option value="line-chart">Line Chart</option>
          <option value="pie-chart">Pie Chart</option>
          <option value="table">Table</option>
          <option value="metric">Metric</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className={cn('rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500')}>
        {loading ? 'Adding...' : 'Add Widget'}
      </button>
    </form>
  );
}
