import type { Metadata } from 'next';
// TRACED:AE-FE-003 — dark mode via @media (prefers-color-scheme: dark) in globals.css
import './globals.css';
import { Nav } from '@/components/nav';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant embeddable analytics platform',
};

// TRACED:AE-FE-004 — root layout with Nav component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
