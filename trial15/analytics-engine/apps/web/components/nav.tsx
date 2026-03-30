import Link from 'next/link';

// TRACED: AE-FE-008 — Nav component provides navigation to all application routes
// TRACED: AE-FE-001 — Root layout includes Nav component with links to all routes and metadata

export function Nav() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Analytics Engine
        </Link>
        <div className="flex gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600">
            Dashboards
          </Link>
          <Link href="/data-sources" className="text-sm font-medium hover:text-blue-600">
            Data Sources
          </Link>
          <Link href="/settings" className="text-sm font-medium hover:text-blue-600">
            Settings
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-blue-600">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
