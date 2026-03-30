import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';

// TRACED: EM-UI-002
export const metadata: Metadata = {
  title: 'Event Management Platform',
  description: 'Multi-tenant event management system for organizing events, venues, and registrations',
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
        <main>{children}</main>
      </body>
    </html>
  );
}
