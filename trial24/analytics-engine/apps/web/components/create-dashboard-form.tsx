// TRACED:WEB-CREATE-DASHBOARD-FORM — Form to create a new dashboard
'use client';

import { useState } from 'react';
import { createDashboardAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

export function CreateDashboardForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const description = form.get('description') as string;

    if (!name) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    try {
      await createDashboardAction(name, description || undefined);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={cn('rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600')}>
        New Dashboard
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('rounded-lg border bg-white p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700')}>
      {error && <div role="alert" className={cn('rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>}
      {loading && <div role="status" aria-busy="true" className={cn('text-sm text-gray-500 dark:text-gray-400')}>Submitting...</div>}
      <div>
        <label htmlFor="dash-name" className={cn('block text-sm font-medium dark:text-gray-200')}>Name</label>
        <input id="dash-name" name="name" required maxLength={255} className={cn('mt-1 w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
      </div>
      <div>
        <label htmlFor="dash-desc" className={cn('block text-sm font-medium dark:text-gray-200')}>Description</label>
        <textarea id="dash-desc" name="description" rows={2} className={cn('mt-1 w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className={cn('rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500')}>
          {loading ? 'Creating...' : 'Create'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={cn('rounded border px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
