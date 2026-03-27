// TRACED: FD-FE-010 — Root layout with <html lang="en"> and dark mode
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleet Dispatch Platform',
  description: 'Multi-tenant fleet management and dispatch platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-50">
        <nav aria-label="Skip links">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 dark:focus:bg-gray-950 dark:focus:text-gray-50">
            Skip to main content
          </a>
        </nav>
        {children}
      </body>
    </html>
  );
}
