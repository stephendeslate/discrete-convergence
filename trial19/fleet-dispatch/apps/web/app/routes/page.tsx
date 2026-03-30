import { getRoutes } from '../../lib/actions';

export default async function RoutesPage() {
  const routes = await getRoutes();

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Routes</h1>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Origin</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Destination</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Distance (km)</th>
            </tr>
          </thead>
          <tbody>
            {routes && routes.data && routes.data.length > 0 ? (
              routes.data.map((r: { id: string; name: string; origin: string; destination: string; distanceKm: number }) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{r.name}</td>
                  <td className="px-4 py-3 text-sm">{r.origin}</td>
                  <td className="px-4 py-3 text-sm">{r.destination}</td>
                  <td className="px-4 py-3 text-sm">{r.distanceKm}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No routes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
