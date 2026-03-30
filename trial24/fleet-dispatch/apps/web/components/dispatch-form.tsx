// TRACED:WEB-DISPATCH-FORM
'use client';

import { useState } from 'react';
import { createDispatchAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

export function DispatchForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    if (!formData.get('vehicleId') || !formData.get('driverId')) {
      setError('Vehicle and driver are required');
      setLoading(false);
      return;
    }

    const result = await createDispatchAction(formData);
    if (!result.success) {
      setError(result.error ?? 'Failed to create dispatch');
    }
    setLoading(false);
  }

  return (
    <div className={cn('bg-white p-6 rounded-lg shadow dark:bg-gray-800')}>
      <h2 className={cn('text-lg font-semibold mb-4 dark:text-white')}>Create Dispatch</h2>
      {error && <div role="alert" className={cn('bg-red-50 text-red-700 p-3 rounded mb-4 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>}
      {loading && <div role="status" aria-busy="true" className={cn('text-sm text-gray-500 mb-4')}>Creating dispatch...</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vehicleId" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>Vehicle ID</label>
            <input id="vehicleId" name="vehicleId" type="text" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
          <div>
            <label htmlFor="driverId" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>Driver ID</label>
            <input id="driverId" name="driverId" type="text" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
          <div>
            <label htmlFor="routeId" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>Route ID</label>
            <input id="routeId" name="routeId" type="text" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
          <div>
            <label htmlFor="scheduledAt" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>Scheduled At</label>
            <input id="scheduledAt" name="scheduledAt" type="datetime-local" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
        </div>
        <button type="submit" disabled={loading} className={cn('bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500')}>
          {loading ? 'Dispatching...' : 'Create Dispatch'}
        </button>
      </form>
    </div>
  );
}
