import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto flex h-14 items-center px-4 gap-6">
        <Link href="/" className="font-semibold">Analytics Engine</Link>
        <Link href="/dashboards" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Dashboards</Link>
        <Link href="/data-sources" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Data Sources</Link>
        <Link href="/widgets" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Widgets</Link>
        <Link href="/api-keys" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">API Keys</Link>
        <Link href="/audit" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Audit Log</Link>
        <Link href="/sync-runs" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Sync Runs</Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Settings</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Login</Link>
        </div>
      </div>
    </nav>
  );
}
