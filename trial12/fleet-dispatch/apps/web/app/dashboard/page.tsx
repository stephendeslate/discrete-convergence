// TRACED: FD-UI-005
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm text-[var(--muted-foreground)]">Active Vehicles</h2>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm text-[var(--muted-foreground)]">Active Drivers</h2>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm text-[var(--muted-foreground)]">Pending Dispatches</h2>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm text-[var(--muted-foreground)]">Active Routes</h2>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold mt-4">Quick Actions</h2>
        <div className="flex gap-2">
          <Link href="/dispatches" className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90">
            New Dispatch
          </Link>
          <Link href="/vehicles" className="px-4 py-2 border border-[var(--border)] rounded hover:bg-[var(--accent)]">
            Manage Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
}
