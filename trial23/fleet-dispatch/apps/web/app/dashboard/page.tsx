import { getDashboards } from '@/lib/actions';

export default async function DashboardPage() {
  const { data } = await getDashboards();
  const dashboards = data as Array<{ id: string; name: string; description?: string }>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.map((d) => (
          <div key={d.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{d.name}</h3>
            {d.description && <p className="text-sm text-gray-500 mt-1">{d.description}</p>}
          </div>
        ))}
        {dashboards.length === 0 && <p className="text-gray-500">No dashboards configured</p>}
      </div>
    </div>
  );
}
