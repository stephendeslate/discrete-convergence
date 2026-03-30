import type { Metadata } from 'next';
import './globals.css';

// TRACED: AE-FE-002 — Root layout with accessibility attributes
export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics dashboard platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav aria-label="Main navigation" className="border-b border-[var(--border)] px-6 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <a href="/" className="text-lg font-semibold">
              Analytics Engine
            </a>
            <div className="flex gap-4">
              <a href="/dashboard" className="hover:underline">
                Dashboards
              </a>
              <a href="/data-sources" className="hover:underline">
                Data Sources
              </a>
              <a href="/settings" className="hover:underline">
                Settings
              </a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
