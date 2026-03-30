// TRACED:FD-FE-001 — Next.js App Router with shadcn/ui components and cn utility
// TRACED:FD-FE-004 — Dark mode via @media prefers-color-scheme in globals.css
import './globals.css';
import Link from 'next/link';
import { APP_VERSION } from '@fleet-dispatch/shared';

export const metadata = {
  title: 'Fleet Dispatch',
  description: 'Multi-tenant fleet management and dispatch coordination platform',
};

function Nav() {
  return (
    <nav style={{ borderBottom: '1px solid var(--border)', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Fleet Dispatch</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/vehicles">Vehicles</Link>
          <Link href="/drivers">Drivers</Link>
          <Link href="/routes">Routes</Link>
          <Link href="/dispatches">Dispatches</Link>
          <Link href="/maintenance">Maintenance</Link>
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
