import Link from 'next/link';
import { APP_VERSION } from '@analytics-engine/shared';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Engine</h1>
      <p className="text-[var(--muted-foreground)]">
        Business analytics dashboards and reporting platform. Version {APP_VERSION}.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/dashboard"
          className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--accent)]"
        >
          <h2 className="text-xl font-semibold">Dashboards</h2>
          <p className="text-[var(--muted-foreground)]">
            Create and manage analytics dashboards
          </p>
        </Link>
        <Link
          href="/data-sources"
          className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--accent)]"
        >
          <h2 className="text-xl font-semibold">Data Sources</h2>
          <p className="text-[var(--muted-foreground)]">
            Connect to databases and APIs
          </p>
        </Link>
        <Link
          href="/widgets"
          className="rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--accent)]"
        >
          <h2 className="text-xl font-semibold">Widgets</h2>
          <p className="text-[var(--muted-foreground)]">
            Charts, tables, and KPI indicators
          </p>
        </Link>
      </div>
    </div>
  );
}
