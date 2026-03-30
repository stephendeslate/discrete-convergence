// TRACED: AE-FE-001 — Root layout with nav, metadata, dark mode support
// TRACED: AE-FE-002 — Responsive container layout
import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '../components/nav';

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
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Nav />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Analytics Engine</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
