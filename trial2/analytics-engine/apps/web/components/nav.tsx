import Link from 'next/link';

// TRACED:AE-UI-004 — Nav component in root layout
export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
              Analytics Engine
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Dashboards
              </Link>
              <Link href="/data-sources" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Data Sources
              </Link>
              <Link href="/settings" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Login
            </Link>
            <Link href="/register" className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm text-[var(--primary-foreground)]">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
