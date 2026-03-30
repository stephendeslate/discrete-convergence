import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '../components/nav';

// TRACED: FD-UI-002
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
        <main id="main-content" role="main" className="min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
