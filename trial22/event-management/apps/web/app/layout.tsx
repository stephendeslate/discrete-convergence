import './globals.css';
import type { Metadata } from 'next';
import { APP_VERSION } from '@repo/shared';

export const metadata: Metadata = {
  title: 'Event Management Platform',
  description: 'Multi-tenant event management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[var(--border)] px-6 py-4">
          <nav className="flex items-center gap-6 max-w-7xl mx-auto">
            <a href="/" className="font-bold text-lg">EventMgmt</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/events" className="hover:underline">Events</a>
            <a href="/venues" className="hover:underline">Venues</a>
            <a href="/tickets" className="hover:underline">Tickets</a>
            <a href="/attendees" className="hover:underline">Attendees</a>
            <a href="/settings" className="hover:underline">Settings</a>
            <span className="ml-auto text-sm text-[var(--muted-foreground)]">v{APP_VERSION}</span>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
