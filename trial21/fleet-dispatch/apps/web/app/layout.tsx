import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fleet Dispatch - Field Service Management',
  description: 'Multi-tenant field service dispatch platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
