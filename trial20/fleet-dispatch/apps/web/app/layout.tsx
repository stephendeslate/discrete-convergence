import type { Metadata } from 'next';
import './globals.css';

// TRACED: FD-SEC-004
export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Multi-tenant fleet and vehicle dispatch management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <nav className="border-b border-[var(--border)] px-6 py-3" role="navigation" aria-label="Main navigation">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <a href="/dashboard" className="text-lg font-semibold">Fleet Dispatch</a>
            <div className="flex gap-4">
              <a href="/dashboard" className="hover:underline">Dashboard</a>
              <a href="/dashboard/vehicles" className="hover:underline">Vehicles</a>
              <a href="/dashboard/routes" className="hover:underline">Routes</a>
              <a href="/dashboard/dispatches" className="hover:underline">Dispatches</a>
              <a href="/dashboard/drivers" className="hover:underline">Drivers</a>
              <a href="/data-sources" className="hover:underline">Data Sources</a>
              <a href="/settings" className="hover:underline">Settings</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-6 py-8" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
