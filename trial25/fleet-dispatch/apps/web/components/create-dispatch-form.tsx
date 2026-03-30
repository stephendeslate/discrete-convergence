// TRACED:FD-WEB-030 — Create dispatch form component
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { createDispatch } from '@/lib/actions';

export default function CreateDispatchForm() {
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('vehicleId', vehicleId);
      formData.set('driverId', driverId);
      formData.set('routeId', routeId);
      formData.set('scheduledAt', scheduledAt);

      const token = localStorage.getItem('token') ?? '';
      await createDispatch(formData, token);
      setMessage('Dispatch created successfully');
      setVehicleId('');
      setDriverId('');
      setRouteId('');
      setScheduledAt('');
    } catch {
      setMessage('Failed to create dispatch');
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow p-6')}>
      <h2 className="text-lg font-semibold mb-4">Create Dispatch</h2>
      {message && (
        <div className="bg-blue-50 text-blue-600 p-3 rounded mb-4 text-sm">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium mb-1">
            Vehicle ID
          </label>
          <input
            id="vehicleId"
            type="text"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="driverId" className="block text-sm font-medium mb-1">
            Driver ID
          </label>
          <input
            id="driverId"
            type="text"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="routeId" className="block text-sm font-medium mb-1">
            Route ID
          </label>
          <input
            id="routeId"
            type="text"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="scheduledAt" className="block text-sm font-medium mb-1">
            Scheduled At
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Dispatch
        </button>
      </form>
    </div>
  );
}
