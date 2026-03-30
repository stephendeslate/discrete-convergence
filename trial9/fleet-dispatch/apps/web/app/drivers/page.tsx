import { getDrivers } from '@/lib/actions';

export default async function DriversPage() {
  const data = await getDrivers() as { items: Array<{ id: string; name: string; email: string; phone: string; status: string }> };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Drivers</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.items.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 text-sm">{d.name}</td>
                <td className="px-4 py-3 text-sm">{d.email}</td>
                <td className="px-4 py-3 text-sm">{d.phone}</td>
                <td className="px-4 py-3 text-sm">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
