// TRACED:WEB-CREATE-VENUE-FORM
'use client';

import { useState } from 'react';
import { createVenueAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

export function CreateVenueForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      formData.set('token', token);
    }

    const result = await createVenueAction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className={cn('bg-white rounded-lg shadow p-6 dark:bg-gray-800')}>
      <h2 className={cn('text-lg font-semibold mb-4 dark:text-white')}>Create New Venue</h2>
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={200}
              className={cn('mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white')}
            />
          </div>
          <div>
            <label htmlFor="address" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className={cn('mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white')}
            />
          </div>
          <div>
            <label htmlFor="capacity" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>
              Capacity
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              required
              min={1}
              className={cn('mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white')}
            />
          </div>
        </div>
        {error && <div role="alert" className={cn('text-red-600 text-sm dark:text-red-400')}>{error}</div>}
        {success && <p className={cn('text-green-600 text-sm dark:text-green-400')}>Venue created successfully!</p>}
        {loading && <div role="status" aria-busy="true" className={cn('text-sm text-gray-500')}>Submitting...</div>}
        <button
          type="submit"
          disabled={loading}
          className={cn('bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500')}
        >
          {loading ? 'Creating...' : 'Create Venue'}
        </button>
      </form>
    </div>
  );
}
