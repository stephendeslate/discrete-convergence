// TRACED:EM-FE-001
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Management',
  description: 'Multi-tenant event management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-white focus:text-blue-600">Skip to main content</a>
        <nav aria-label="Main navigation" className="border-b bg-white px-6 py-3 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
          <a href="/events" className="text-xl font-bold dark:text-white">Event Management</a>
          <div className="flex gap-4">
            <a href="/events" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Events</a>
            <a href="/venues" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Venues</a>
            <a href="/tickets" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Tickets</a>
            <a href="/speakers" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Speakers</a>
            <a href="/sessions" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Sessions</a>
            <a href="/settings" className="hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Settings</a>
          </div>
        </nav>
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
