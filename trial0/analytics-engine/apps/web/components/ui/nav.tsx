import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          Analytics Engine
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboards" className="text-sm hover:underline">
            Dashboards
          </Link>
          <Link href="/data-sources" className="text-sm hover:underline">
            Data Sources
          </Link>
          <Link href="/embed-settings" className="text-sm hover:underline">
            Embed
          </Link>
          <Link href="/api-keys" className="text-sm hover:underline">
            API Keys
          </Link>
          <Link href="/settings" className="text-sm hover:underline">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
