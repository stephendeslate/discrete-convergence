// TRACED:FD-WEB-025 — Vehicle list component
'use client';

import { cn } from '@/lib/utils';

interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: string;
  status: string;
  capacity: number;
}

export default function VehicleList({ vehicles = [] }: { vehicles?: Vehicle[] }) {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden')}>
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Vehicle Fleet</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.length === 0 ? (
            <tr>
              <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                No vehicles found
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 text-sm font-medium">{vehicle.name}</td>
                <td className="px-6 py-4 text-sm">{vehicle.plateNumber}</td>
                <td className="px-6 py-4 text-sm">{vehicle.type}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      vehicle.status === 'ACTIVE' && 'bg-green-100 text-green-800',
                      vehicle.status === 'INACTIVE' && 'bg-gray-100 text-gray-800',
                      vehicle.status === 'MAINTENANCE' && 'bg-yellow-100 text-yellow-800',
                    )}
                  >
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{vehicle.capacity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
