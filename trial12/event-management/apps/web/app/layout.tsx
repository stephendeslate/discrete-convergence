import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';

// TRACED: EM-UI-004
export const metadata: Metadata = {
  title: 'Event Management',
  description: 'Conference and meetup event management platform',
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
