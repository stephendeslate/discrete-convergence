// TRACED:WEB-DISPATCHES-PAGE
'use client';

import { useState } from 'react';
import { createDispatchAction } from '@/lib/actions';

export default function DispatchesPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await createDispatchAction(formData);

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error ?? 'Failed to create dispatch');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dispatches</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Create Dispatch</h2>
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">Dispatch created</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
              Vehicle ID
            </label>
            <input
              id="vehicleId"
              name="vehicleId"
              type="text"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
              Driver ID
            </label>
            <input
              id="driverId"
              name="driverId"
              type="text"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="routeId" className="block text-sm font-medium text-gray-700">
              Route ID
            </label>
            <input
              id="routeId"
              name="routeId"
              type="text"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
              Scheduled At
            </label>
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Create Dispatch
          </button>
        </form>
      </div>
    </div>
  );
}
