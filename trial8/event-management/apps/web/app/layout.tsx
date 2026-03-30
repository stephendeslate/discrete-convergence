import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Management',
  description: 'Event management platform',
};

// TRACED: EM-UI-001 — Root layout with global styles
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <a href="/dashboard" className="text-xl font-bold text-indigo-600">
              Event Management
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/dashboard" className="hover:text-indigo-600">Dashboard</a>
              <a href="/events" className="hover:text-indigo-600">Events</a>
              <a href="/login" className="hover:text-indigo-600">Login</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
