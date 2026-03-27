import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Analytics dashboard management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <nav className="border-b bg-card" aria-label="Main navigation">
          <a href="#main-content" className="text-foreground sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-foreground">
            Skip to main content
          </a>
          <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
            <a href="/dashboard" className="text-lg font-semibold text-foreground">
              Analytics Engine
            </a>
            <div className="ml-8 flex gap-4">
              <a href="/dashboard" className="text-sm text-foreground hover:underline">Dashboard</a>
              <a href="/dashboard/list" className="text-sm text-foreground hover:underline">Dashboards</a>
              <a href="/data-sources" className="text-sm text-foreground hover:underline">Data Sources</a>
              <a href="/data-sources/sync-runs" className="text-sm text-foreground hover:underline">Sync History</a>
              <a href="/dashboard/audit" className="text-sm text-foreground hover:underline">Audit Log</a>
              <a href="/settings" className="text-sm text-foreground hover:underline">Settings</a>
            </div>
          </div>
        </nav>
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
