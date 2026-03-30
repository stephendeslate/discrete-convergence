// TRACED: FD-UI-002
import Link from 'next/link';
import { APP_VERSION } from '@fleet-dispatch/shared';

export function Nav() {
  return (
    <nav role="navigation" aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">Fleet Dispatch</Link>
          <Link href="/dashboard" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Dashboard</Link>
          <Link href="/vehicles" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Vehicles</Link>
          <Link href="/drivers" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Drivers</Link>
          <Link href="/dispatches" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Dispatches</Link>
          <Link href="/routes" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Routes</Link>
          <Link href="/settings" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Settings</Link>
        </div>
        <span className="text-sm text-[var(--muted-foreground)]">v{APP_VERSION}</span>
      </div>
    </nav>
  );
}
