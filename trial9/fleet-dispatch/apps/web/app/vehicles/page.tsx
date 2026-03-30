import { getVehicles } from '@/lib/actions';

export default async function VehiclesPage() {
  const data = await getVehicles() as { items: Array<{ id: string; licensePlate: string; make: string; model: string; year: number; status: string }> };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Vehicles</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">License Plate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Make</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Model</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Year</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.items.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3 text-sm">{v.licensePlate}</td>
                <td className="px-4 py-3 text-sm">{v.make}</td>
                <td className="px-4 py-3 text-sm">{v.model}</td>
                <td className="px-4 py-3 text-sm">{v.year}</td>
                <td className="px-4 py-3 text-sm">{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
