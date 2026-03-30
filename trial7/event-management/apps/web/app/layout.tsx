import './globals.css';
import type { Metadata } from 'next';
import { Nav } from '../components/nav';

export const metadata: Metadata = {
  title: 'Event Management',
  description: 'Event planning and ticketing platform',
};

// TRACED:EM-FE-004
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
