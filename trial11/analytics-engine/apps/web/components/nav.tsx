import Link from 'next/link';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-UI-003
export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          Analytics Engine <span className="text-xs text-[var(--muted-foreground)]">v{APP_VERSION}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Dashboards
          </Link>
          <Link href="/data-sources" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Data Sources
          </Link>
          <Link href="/settings" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Settings
          </Link>
          <Link href="/login" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
