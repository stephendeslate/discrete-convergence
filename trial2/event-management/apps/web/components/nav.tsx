import Link from 'next/link';
import { APP_VERSION } from '@event-management/shared';

// TRACED:EM-UI-003 — Nav component uses APP_VERSION from shared

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          Event Management
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Dashboard
          </Link>
          <Link
            href="/venues"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Venues
          </Link>
          <Link
            href="/settings"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Settings
          </Link>
          <Link
            href="/login"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Login
          </Link>
          <span className="text-xs text-[var(--muted-foreground)]">
            v{APP_VERSION}
          </span>
        </div>
      </div>
    </nav>
  );
}
