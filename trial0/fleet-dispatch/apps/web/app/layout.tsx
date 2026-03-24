import type { Metadata } from 'next';
import { Nav } from '@/components/ui/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'FleetDispatch',
  description: 'Multi-tenant field service dispatch platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
