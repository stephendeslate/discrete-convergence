import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background)]" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-[var(--primary)]">
              Fleet Dispatch
            </Link>
            <div className="hidden md:flex md:gap-4">
              <Link href="/dashboard" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Dashboard
              </Link>
              <Link href="/vehicles" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Vehicles
              </Link>
              <Link href="/drivers" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Drivers
              </Link>
              <Link href="/routes" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Routes
              </Link>
              <Link href="/dispatches" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Dispatches
              </Link>
              <Link href="/maintenance" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                Maintenance
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Settings
            </Link>
            <Link href="/login" className="text-sm text-[var(--primary)]">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
