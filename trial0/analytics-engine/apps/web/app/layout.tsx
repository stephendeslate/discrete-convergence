// TRACED:AE-FE-005 — Root layout with Nav component
import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/ui/nav';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant embeddable analytics platform',
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
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
