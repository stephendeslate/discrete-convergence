import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
          Analytics Engine
        </Link>
        <div className="flex gap-4">
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
