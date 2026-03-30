import { getDispatches } from '@/lib/actions';

export default async function DispatchesPage() {
  const data = await getDispatches() as { items: Array<{ id: string; status: string; scheduledAt: string; notes: string }> };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Dispatches</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Scheduled</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.items.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 text-sm font-mono">{d.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-sm">{d.status}</td>
                <td className="px-4 py-3 text-sm">{d.scheduledAt}</td>
                <td className="px-4 py-3 text-sm">{d.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
