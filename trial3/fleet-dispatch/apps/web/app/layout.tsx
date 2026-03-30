import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

// TRACED:FD-UI-004 — Dark mode via @media (prefers-color-scheme: dark) in globals.css

export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Multi-tenant field service dispatch platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
