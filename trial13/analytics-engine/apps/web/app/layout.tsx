import './globals.css';
import type { Metadata } from 'next';
import { Nav } from '@/components/nav';

// TRACED: AE-FE-001
export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics dashboard',
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
