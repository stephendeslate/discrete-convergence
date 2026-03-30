// TRACED:FD-WEB-029 — Create vehicle form component
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { createVehicle } from '@/lib/actions';

export default function CreateVehicleForm() {
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState('TRUCK');
  const [capacity, setCapacity] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('plateNumber', plateNumber);
      formData.set('type', type);
      formData.set('capacity', capacity);

      const token = localStorage.getItem('token') ?? '';
      await createVehicle(formData, token);
      setMessage('Vehicle created successfully');
      setName('');
      setPlateNumber('');
      setCapacity('');
    } catch {
      setMessage('Failed to create vehicle');
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow p-6')}>
      <h2 className="text-lg font-semibold mb-4">Add Vehicle</h2>
      {message && (
        <div className="bg-blue-50 text-blue-600 p-3 rounded mb-4 text-sm">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="vehicle-name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="vehicle-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="plate" className="block text-sm font-medium mb-1">
            Plate Number
          </label>
          <input
            id="plate"
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="vehicle-type" className="block text-sm font-medium mb-1">
            Type
          </label>
          <select
            id="vehicle-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="CAR">Car</option>
            <option value="MOTORCYCLE">Motorcycle</option>
          </select>
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium mb-1">
            Capacity
          </label>
          <input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            min="1"
            max="100"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Vehicle
        </button>
      </form>
    </div>
  );
}
