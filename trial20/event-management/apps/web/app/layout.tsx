import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';

const inter = Inter({ subsets: ['latin'] });

// TRACED: EM-FE-005 — Root layout with semantic HTML structure
export const metadata: Metadata = {
  title: 'Event Management Platform',
  description: 'Manage events, venues, attendees, and registrations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            Event Management Platform v1.0.0
          </footer>
        </div>
      </body>
    </html>
  );
}
