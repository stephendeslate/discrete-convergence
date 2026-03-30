import { getRoutes } from '@/lib/actions';

export default async function RoutesPage() {
  const { data } = await getRoutes();
  const routes = data as Array<{ id: string; name: string; date: string; technician?: { user?: { name: string } }; stops?: unknown[] }>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Routes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route) => (
          <div key={route.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{route.name}</h3>
            <p className="text-sm text-gray-500">Date: {new Date(route.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Technician: {route.technician?.user?.name ?? 'Unassigned'}</p>
            <p className="text-sm text-gray-500">Stops: {route.stops?.length ?? 0}</p>
          </div>
        ))}
        {routes.length === 0 && <p className="text-gray-500">No routes found</p>}
      </div>
    </div>
  );
}
