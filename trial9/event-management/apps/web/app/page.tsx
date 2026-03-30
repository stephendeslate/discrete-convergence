import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Event Management Platform</h1>
      <p className="text-[var(--muted-foreground)]">
        Manage your events, venues, tickets, and attendees all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)]"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-[var(--border)] px-4 py-2"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
