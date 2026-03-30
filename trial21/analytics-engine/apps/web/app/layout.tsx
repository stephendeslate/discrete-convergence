import type { Metadata } from 'next';

/**
 * VERIFY: AE-A11Y-001 — root layout with lang attribute and title
 */
export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant embeddable analytics platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">{/* TRACED: AE-A11Y-001 */}
      <body>{children}</body>
    </html>
  );
}
