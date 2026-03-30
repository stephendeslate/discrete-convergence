// TRACED:WEB-VEHICLE-LIST
'use client';

import { useEffect, useState } from 'react';
import { fetchVehicles } from '@/lib/actions';
import type { Vehicle } from '@/lib/api';
import { cn } from '@/lib/utils';

export function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles()
      .then((res) => {
        setVehicles(res.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading vehicles...</div>;
  }

  if (error) {
    return <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>Error: {error}</div>;
  }

  if (vehicles.length === 0) {
    return <div className={cn('text-gray-500 dark:text-gray-400')}>No vehicles found.</div>;
  }

  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800')}>
      <table className={cn('min-w-full divide-y divide-gray-200 dark:divide-gray-700')}>
        <thead className={cn('bg-gray-50 dark:bg-gray-700')}>
          <tr>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>VIN</th>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>Make / Model</th>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>Year</th>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>Status</th>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>License Plate</th>
          </tr>
        </thead>
        <tbody className={cn('bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700')}>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white')}>{vehicle.vin}</td>
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white')}>{vehicle.make} {vehicle.model}</td>
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400')}>{vehicle.year}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  'px-2 py-1 text-xs rounded-full',
                  vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  vehicle.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                )}>
                  {vehicle.status}
                </span>
              </td>
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400')}>{vehicle.licensePlate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
