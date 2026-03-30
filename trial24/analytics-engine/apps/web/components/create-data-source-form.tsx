// TRACED:WEB-CREATE-DATASOURCE-FORM — Form to create a new data source
'use client';

import { useState } from 'react';
import { createDataSourceAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

export function CreateDataSourceForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const type = form.get('type') as string;
    const connectionString = form.get('connectionString') as string;

    if (!name || !connectionString) {
      setError('Name and connection string are required');
      setLoading(false);
      return;
    }

    try {
      await createDataSourceAction(name, type, connectionString);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data source');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={cn('rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500')}>
        New Data Source
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('rounded-lg border bg-white p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700')}>
      {error && <div role="alert" className={cn('rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>}
      {loading && <div role="status" aria-busy="true" className={cn('text-sm text-gray-500')}>Submitting...</div>}
      <div>
        <label htmlFor="ds-name" className={cn('block text-sm font-medium dark:text-gray-200')}>Name</label>
        <input id="ds-name" name="name" required className={cn('mt-1 w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
      </div>
      <div>
        <label htmlFor="ds-type" className={cn('block text-sm font-medium dark:text-gray-200')}>Type</label>
        <select id="ds-type" name="type" className={cn('mt-1 w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white')}>
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="rest-api">REST API</option>
        </select>
      </div>
      <div>
        <label htmlFor="ds-conn" className={cn('block text-sm font-medium dark:text-gray-200')}>Connection String</label>
        <input id="ds-conn" name="connectionString" required className={cn('mt-1 w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
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
