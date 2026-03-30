import Link from 'next/link';
import { APP_VERSION } from '@fleet-dispatch/shared';

// TRACED: FD-CROSS-004
export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-lg font-bold">
            Fleet Dispatch
          </Link>
          <Link href="/vehicles" className="text-sm hover:text-[var(--primary)]">
            Vehicles
          </Link>
          <Link href="/drivers" className="text-sm hover:text-[var(--primary)]">
            Drivers
          </Link>
          <Link href="/dispatches" className="text-sm hover:text-[var(--primary)]">
            Dispatches
          </Link>
          <Link href="/settings" className="text-sm hover:text-[var(--primary)]">
            Settings
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-[var(--muted-foreground)]">v{APP_VERSION}</span>
          <form action="/api/logout" method="post">
            <button type="submit" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
