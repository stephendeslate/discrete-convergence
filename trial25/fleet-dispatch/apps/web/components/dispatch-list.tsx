// TRACED:FD-WEB-028 — Dispatch list component
'use client';

import { cn } from '@/lib/utils';

interface Dispatch {
  id: string;
  status: string;
  scheduledAt: string;
  vehicle?: { name: string };
  driver?: { name: string };
  route?: { name: string };
}

export default function DispatchList({ dispatches = [] }: { dispatches?: Dispatch[] }) {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden')}>
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Dispatches</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dispatches.length === 0 ? (
            <tr>
              <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                No dispatches found
              </td>
            </tr>
          ) : (
            dispatches.map((dispatch) => (
              <tr key={dispatch.id}>
                <td className="px-6 py-4 text-sm">{dispatch.vehicle?.name ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{dispatch.driver?.name ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{dispatch.route?.name ?? '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      dispatch.status === 'COMPLETED' && 'bg-green-100 text-green-800',
                      dispatch.status === 'CANCELLED' && 'bg-red-100 text-red-800',
                      dispatch.status === 'IN_TRANSIT' && 'bg-blue-100 text-blue-800',
                      dispatch.status === 'ASSIGNED' && 'bg-yellow-100 text-yellow-800',
                      dispatch.status === 'PENDING' && 'bg-gray-100 text-gray-800',
                    )}
                  >
                    {dispatch.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(dispatch.scheduledAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
