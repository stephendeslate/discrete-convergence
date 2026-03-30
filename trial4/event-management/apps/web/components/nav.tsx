import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          EventMgmt
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Dashboard
          </Link>
          <Link href="/events" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Events
          </Link>
          <Link href="/venues" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Venues
          </Link>
          <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
