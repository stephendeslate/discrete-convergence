// TRACED:WEB-LAYOUT
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
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-white focus:text-blue-600">Skip to main content</a>
        <nav aria-label="Main navigation" className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Fleet Dispatch
            </a>
            <div className="flex gap-4">
              <a href="/vehicles" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Vehicles
              </a>
              <a href="/drivers" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Drivers
              </a>
              <a href="/routes" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Routes
              </a>
              <a href="/dispatches" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Dispatches
              </a>
              <a href="/settings" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Settings
              </a>
              <a href="/login" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Login
              </a>
            </div>
          </div>
        </nav>
        <main id="main-content" className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
