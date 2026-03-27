// TRACED: EM-FE-007 — 8+ shadcn/ui components in components/ui/
// TRACED: EM-FE-008 — Root layout with dark mode and navigation
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Management Platform',
  description: 'Manage your events, venues, and registrations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-foreground">
          Skip to main content
        </a>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <nav aria-label="Main navigation" className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="font-bold">
                EventMgmt
              </Link>
              <Link href="/events" className="transition-colors hover:text-foreground/80">
                Events
              </Link>
              <Link href="/venues" className="transition-colors hover:text-foreground/80">
                Venues
              </Link>
              <Link href="/registrations" className="transition-colors hover:text-foreground/80">
                Registrations
              </Link>
              <Link href="/audit-log" className="transition-colors hover:text-foreground/80">
                Audit Log
              </Link>
              <Link href="/settings" className="transition-colors hover:text-foreground/80">
                Settings
              </Link>
            </nav>
          </div>
        </header>
        <main id="main-content" className="container mx-auto py-6 px-4">{children}</main>
      </body>
    </html>
  );
}
