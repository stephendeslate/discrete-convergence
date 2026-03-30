import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="container mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="text-lg font-bold text-[var(--primary)]">
          Event Manager
        </Link>
        <Link href="/dashboard" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Dashboard
        </Link>
        <Link href="/events" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Events
        </Link>
        <Link href="/venues" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Venues
        </Link>
        <Link href="/attendees" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Attendees
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login" className="text-[var(--foreground)] hover:text-[var(--primary)]">
            Login
          </Link>
          <Link href="/settings" className="text-[var(--foreground)] hover:text-[var(--primary)]">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
