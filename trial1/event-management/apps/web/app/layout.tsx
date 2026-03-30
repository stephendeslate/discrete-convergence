// TRACED:EM-FE-001 — Next.js App Router with shadcn/ui components and cn utility
// TRACED:EM-FE-004 — Dark mode via @media prefers-color-scheme in globals.css
import './globals.css';
import { APP_VERSION } from '@event-management/shared';

export const metadata = {
  title: 'Event Management',
  description: 'Multi-tenant event management platform',
};

function Nav() {
  return (
    <nav style={{ borderBottom: '1px solid var(--border)', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <a href="/" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Event Management</a>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/events">Events</a>
          <a href="/venues">Venues</a>
          <a href="/registrations">Registrations</a>
          <a href="/settings">Settings</a>
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
