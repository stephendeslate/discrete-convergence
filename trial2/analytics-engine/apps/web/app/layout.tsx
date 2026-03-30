import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

// TRACED:AE-UI-001 — Dark mode via @media (prefers-color-scheme: dark) in globals.css

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
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
