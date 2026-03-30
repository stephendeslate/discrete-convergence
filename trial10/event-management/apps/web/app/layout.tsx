// TRACED:EM-FE-001 — Next.js App Router with shadcn/ui components and cn utility
// TRACED:EM-FE-004 — Dark mode via @media prefers-color-scheme in globals.css
// TRACED:EM-CROSS-004 — Shared package consumed by web app via workspace:* import
import './globals.css';
import Link from 'next/link';
import { APP_VERSION } from '@event-management/shared';

export const metadata = {
  title: 'Event Management',
  description: 'Multi-tenant event management platform',
};

function Nav() {
  return (
    <nav style={{ borderBottom: '1px solid var(--border)', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Event Management</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/events">Events</Link>
          <Link href="/venues">Venues</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </div>
      <span style={{ display: 'none' }}>{APP_VERSION}</span>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
