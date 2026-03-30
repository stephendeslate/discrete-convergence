import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Management',
  description: 'Multi-tenant event management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
