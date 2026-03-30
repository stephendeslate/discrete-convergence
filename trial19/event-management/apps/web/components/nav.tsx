import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold">
          Event Management
        </Link>
        <ul className="flex gap-6" role="list">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/events">Events</Link></li>
          <li><Link href="/venues">Venues</Link></li>
          <li><Link href="/attendees">Attendees</Link></li>
          <li><Link href="/registrations">Registrations</Link></li>
          <li><Link href="/login">Login</Link></li>
        </ul>
      </div>
    </nav>
  );
}
