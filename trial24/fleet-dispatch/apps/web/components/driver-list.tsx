// TRACED:WEB-DRIVER-LIST
'use client';

import { useEffect, useState } from 'react';
import { fetchDrivers } from '@/lib/actions';
import type { Driver } from '@/lib/api';
import { cn } from '@/lib/utils';

export function DriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers()
      .then((res) => {
        setDrivers(res.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading drivers...</div>;
  }

  if (error) {
    return <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>Error: {error}</div>;
  }

  if (drivers.length === 0) {
    return <div className={cn('text-gray-500 dark:text-gray-400')}>No drivers found.</div>;
  }

  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800')}>
      <table className={cn('min-w-full divide-y divide-gray-200 dark:divide-gray-700')}>
        <thead className={cn('bg-gray-50 dark:bg-gray-700')}>
          <tr>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>Name</th>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>Email</th>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>License</th>
            <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300')}>Status</th>
          </tr>
        </thead>
        <tbody className={cn('bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700')}>
          {drivers.map((driver) => (
            <tr key={driver.id}>
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white')}>{driver.name}</td>
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400')}>{driver.email}</td>
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400')}>{driver.licenseNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  'px-2 py-1 text-xs rounded-full',
                  driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  driver.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                )}>
                  {driver.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
