// TRACED:EM-UI-003
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
          Event Manager
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Dashboard
          </Link>
          <Link
            href="/events"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Events
          </Link>
          <Link
            href="/venues"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Venues
          </Link>
          <Link
            href="/registrations"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Registrations
          </Link>
          <Link
            href="/settings"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Settings
          </Link>
          <Link
            href="/login"
            className="text-sm text-[var(--primary)]"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
