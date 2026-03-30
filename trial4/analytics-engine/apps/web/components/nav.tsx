import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--primary)]">
          Analytics Engine
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="hover:text-[var(--primary)] transition">
            Dashboards
          </Link>
          <Link href="/data-sources" className="hover:text-[var(--primary)] transition">
            Data Sources
          </Link>
          <Link href="/settings" className="hover:text-[var(--primary)] transition">
            Settings
          </Link>
          <Link href="/api-keys" className="hover:text-[var(--primary)] transition">
            API Keys
          </Link>
        </div>
      </div>
    </nav>
  );
}
