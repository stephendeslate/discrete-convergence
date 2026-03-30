import type { Metadata } from 'next';
import './globals.css';

// TRACED: AE-FE-001
export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics dashboard platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
