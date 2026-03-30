import { getDispatches } from '../../lib/actions';

export default async function DispatchesPage() {
  const dispatches = await getDispatches();

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dispatches</h1>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Driver</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Route</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Scheduled</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {dispatches && dispatches.data && dispatches.data.length > 0 ? (
              dispatches.data.map((d: { id: string; vehicleId: string; driverId: string; routeId: string; scheduledAt: string; status: string }) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{d.vehicleId}</td>
                  <td className="px-4 py-3 text-sm">{d.driverId}</td>
                  <td className="px-4 py-3 text-sm">{d.routeId}</td>
                  <td className="px-4 py-3 text-sm">{d.scheduledAt}</td>
                  <td className="px-4 py-3 text-sm">{d.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No dispatches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
