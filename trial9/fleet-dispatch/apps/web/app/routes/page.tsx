import { getRoutes } from '@/lib/actions';

export default async function RoutesPage() {
  const data = await getRoutes() as { items: Array<{ id: string; name: string; origin: string; destination: string; distanceMiles: string }> };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Routes</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Origin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Distance (mi)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.items.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-sm">{r.name}</td>
                <td className="px-4 py-3 text-sm">{r.origin}</td>
                <td className="px-4 py-3 text-sm">{r.destination}</td>
                <td className="px-4 py-3 text-sm">{r.distanceMiles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
