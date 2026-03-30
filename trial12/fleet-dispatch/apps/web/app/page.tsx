// TRACED: FD-UI-004
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fleet Dispatch</h1>
      <p className="text-[var(--muted-foreground)]">
        Manage your fleet operations, track vehicles, coordinate dispatches, and optimize routes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/vehicles" className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
          <h2 className="font-semibold text-lg">Vehicles</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Manage your fleet vehicles</p>
        </Link>
        <Link href="/drivers" className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
          <h2 className="font-semibold text-lg">Drivers</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Manage fleet drivers</p>
        </Link>
        <Link href="/dispatches" className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
          <h2 className="font-semibold text-lg">Dispatches</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Track deliveries and pickups</p>
        </Link>
        <Link href="/routes" className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
          <h2 className="font-semibold text-lg">Routes</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Plan and optimize routes</p>
        </Link>
      </div>
    </div>
  );
}
