import Link from 'next/link';

// TRACED: EM-UI-002
export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          EventMgr
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/events" className="hover:underline">
            Events
          </Link>
          <Link href="/venues" className="hover:underline">
            Venues
          </Link>
          <Link href="/settings" className="hover:underline">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
