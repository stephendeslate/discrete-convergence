import Link from 'next/link';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-UI-002
export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-bold text-[var(--primary)]">
              Analytics Engine
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Dashboards
              </Link>
              <Link href="/data-sources" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Data Sources
              </Link>
              <Link href="/settings" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--muted-foreground)]">v{APP_VERSION}</span>
            <Link href="/login" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
