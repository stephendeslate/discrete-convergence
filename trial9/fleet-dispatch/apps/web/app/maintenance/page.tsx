import { getMaintenance } from '@/lib/actions';

export default async function MaintenancePage() {
  const data = await getMaintenance() as { items: Array<{ id: string; description: string; status: string; scheduledAt: string; cost: string }> };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Maintenance</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Scheduled</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.items.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-sm">{m.description}</td>
                <td className="px-4 py-3 text-sm">{m.status}</td>
                <td className="px-4 py-3 text-sm">{m.scheduledAt}</td>
                <td className="px-4 py-3 text-sm">${m.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
