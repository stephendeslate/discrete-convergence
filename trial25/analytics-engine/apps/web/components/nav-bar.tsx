// TRACED:AE-WEB-NAV-001 — Navigation bar component
'use client';

import Link from 'next/link';

export function NavBar(): React.ReactElement {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Analytics Engine
          </Link>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Dashboards
            </Link>
            <Link href="/data-sources" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Data Sources
            </Link>
            <Link href="/widgets" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Widgets
            </Link>
            <Link href="/analytics" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Analytics
            </Link>
            <Link href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
