// TRACED:FD-FE-005 — Root layout with navigation and APP_VERSION
import type { Metadata } from 'next';
import { APP_VERSION } from '@fleet-dispatch/shared';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Multi-tenant field service dispatch platform',
};

function Nav() {
  return (
    <nav className="border-b border-border bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold">Fleet Dispatch</span>
          <a href="/dispatch" className="text-sm text-muted-foreground hover:text-foreground">
            Dispatch
          </a>
          <a href="/work-orders" className="text-sm text-muted-foreground hover:text-foreground">
            Work Orders
          </a>
          <a href="/technicians" className="text-sm text-muted-foreground hover:text-foreground">
            Technicians
          </a>
          <a href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
            Settings
          </a>
        </div>
        <span className="text-xs text-muted-foreground">v{APP_VERSION}</span>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
