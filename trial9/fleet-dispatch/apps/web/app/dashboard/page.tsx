import Link from 'next/link';

// TRACED: FD-UI-004
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/vehicles" className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--secondary)]">
          <h2 className="text-lg font-semibold">Vehicles</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Manage your fleet vehicles</p>
        </Link>
        <Link href="/drivers" className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--secondary)]">
          <h2 className="text-lg font-semibold">Drivers</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Manage driver assignments</p>
        </Link>
        <Link href="/routes" className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--secondary)]">
          <h2 className="text-lg font-semibold">Routes</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Configure delivery routes</p>
        </Link>
        <Link href="/dispatches" className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--secondary)]">
          <h2 className="text-lg font-semibold">Dispatches</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Track active dispatches</p>
        </Link>
        <Link href="/maintenance" className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--secondary)]">
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Schedule vehicle maintenance</p>
        </Link>
        <Link href="/settings" className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--secondary)]">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Account and preferences</p>
        </Link>
      </div>
    </div>
  );
}
