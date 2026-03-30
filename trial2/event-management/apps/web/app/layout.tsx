import type { Metadata } from 'next';
import { Nav } from '../components/nav';
import './globals.css';

// TRACED:EM-UI-004 — Root layout with Nav component

export const metadata: Metadata = {
  title: 'Event Management',
  description: 'Multi-tenant event management platform',
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
