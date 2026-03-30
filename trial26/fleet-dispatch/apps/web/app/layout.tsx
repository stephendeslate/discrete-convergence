// TRACED:WEB-LAYOUT — Root layout with metadata
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Multi-tenant fleet dispatch platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-white focus:text-blue-600"
        >
          Skip to main content
        </a>
        <nav
          aria-label="Main navigation"
          className="border-b bg-white px-6 py-3 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700"
        >
          <a href="/vehicles" className="text-xl font-bold dark:text-white">
            Fleet Dispatch
          </a>
          <div className="flex gap-4">
            <a href="/vehicles" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Vehicles</a>
            <a href="/drivers" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Drivers</a>
            <a href="/dispatches" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Dispatches</a>
            <a href="/routes" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Routes</a>
            <a href="/settings" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Settings</a>
          </div>
        </nav>
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
