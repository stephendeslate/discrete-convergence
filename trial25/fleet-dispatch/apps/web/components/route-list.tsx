// TRACED:FD-WEB-027 — Route list component
'use client';

import { cn } from '@/lib/utils';

interface RouteItem {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
}

export default function RouteList({ routes = [] }: { routes?: RouteItem[] }) {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden')}>
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Routes</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance (km)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (min)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {routes.length === 0 ? (
            <tr>
              <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                No routes found
              </td>
            </tr>
          ) : (
            routes.map((route) => (
              <tr key={route.id}>
                <td className="px-6 py-4 text-sm font-medium">{route.name}</td>
                <td className="px-6 py-4 text-sm">{route.origin}</td>
                <td className="px-6 py-4 text-sm">{route.destination}</td>
                <td className="px-6 py-4 text-sm">{route.distance}</td>
                <td className="px-6 py-4 text-sm">{route.estimatedDuration}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
