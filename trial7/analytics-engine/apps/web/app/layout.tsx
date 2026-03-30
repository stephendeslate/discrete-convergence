import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';

// TRACED:AE-UI-004
export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Real-time analytics dashboard platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
