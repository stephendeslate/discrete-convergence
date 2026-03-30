import type { Metadata } from 'next';
import { Nav } from '../components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Multi-tenant fleet and vehicle dispatch management system',
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
