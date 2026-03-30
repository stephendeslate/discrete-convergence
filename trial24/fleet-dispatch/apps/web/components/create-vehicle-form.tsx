// TRACED:WEB-CREATE-VEHICLE-FORM
'use client';

import { useState } from 'react';
import { createVehicleAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

export function CreateVehicleForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createVehicleAction(formData);

    if (result.success) {
      setSuccess(true);
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error ?? 'Failed to create vehicle');
    }
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn('bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600')}
      >
        Add Vehicle
      </button>
    );
  }

  return (
    <div className={cn('bg-white p-6 rounded-lg shadow dark:bg-gray-800')}>
      <h2 className={cn('text-lg font-semibold mb-4 dark:text-white')}>Add New Vehicle</h2>
      {error && <div role="alert" className={cn('bg-red-50 text-red-700 p-3 rounded mb-4 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>}
      {success && <div className={cn('bg-green-50 text-green-700 p-3 rounded mb-4 dark:bg-green-900/30 dark:text-green-400')}>Vehicle created</div>}
      {loading && <div role="status" aria-busy="true" className={cn('text-sm text-gray-500 mb-4')}>Submitting...</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vin" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>VIN</label>
            <input id="vin" name="vin" type="text" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
          <div>
            <label htmlFor="licensePlate" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>License Plate</label>
            <input id="licensePlate" name="licensePlate" type="text" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
          <div>
            <label htmlFor="make" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>Make</label>
            <input id="make" name="make" type="text" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
          <div>
            <label htmlFor="model" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>Model</label>
            <input id="model" name="model" type="text" required className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
          <div>
            <label htmlFor="year" className={cn('block text-sm font-medium text-gray-700 dark:text-gray-200')}>Year</label>
            <input id="year" name="year" type="number" required min={1900} max={2030} className={cn('mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white')} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className={cn('bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500')}>
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className={cn('bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
