// TRACED:WEB-LAYOUT
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Management',
  description: 'Multi-tenant event management platform',
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
            <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Event Management
            </a>
            <div className="flex gap-4">
              <a href="/events" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Events</a>
              <a href="/venues" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Venues</a>
              <a href="/speakers" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Speakers</a>
              <a href="/sessions" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Sessions</a>
              <a href="/tickets" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Tickets</a>
              <a href="/settings" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Settings</a>
              <a href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Login</a>
            </div>
          </div>
        </nav>
        <main id="main-content" className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
