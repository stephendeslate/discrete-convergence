// TRACED:FD-WEB-026 — Driver list component
'use client';

import { cn } from '@/lib/utils';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function DriverList({ drivers = [] }: { drivers?: Driver[] }) {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden')}>
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Drivers</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {drivers.length === 0 ? (
            <tr>
              <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                No drivers found
              </td>
            </tr>
          ) : (
            drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-6 py-4 text-sm font-medium">{driver.name}</td>
                <td className="px-6 py-4 text-sm">{driver.email}</td>
                <td className="px-6 py-4 text-sm">{driver.phone}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      driver.status === 'AVAILABLE' && 'bg-green-100 text-green-800',
                      driver.status === 'ON_DUTY' && 'bg-blue-100 text-blue-800',
                      driver.status === 'OFF_DUTY' && 'bg-gray-100 text-gray-800',
                    )}
                  >
                    {driver.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
