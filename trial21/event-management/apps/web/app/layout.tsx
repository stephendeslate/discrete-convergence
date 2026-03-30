import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Management Platform',
  description: 'Multi-tenant event management with ticketing and check-in',
};

/** TRACED:EM-FE-005 — Root layout with html lang, title, semantic structure */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav aria-label="Main navigation">
            <a href="/dashboard">Dashboard</a>
            <a href="/events">Events</a>
            <a href="/public-events">Discover</a>
            <a href="/my-registrations">My Registrations</a>
            <a href="/settings">Settings</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>Event Management Platform</p>
        </footer>
      </body>
    </html>
  );
}
