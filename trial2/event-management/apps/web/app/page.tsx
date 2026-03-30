import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome to Event Management</h1>
      <p className="text-[var(--muted-foreground)]">
        A multi-tenant platform for creating, scheduling, and managing events
        with attendee registration, ticketing, and check-in.
      </p>
      <p className="text-sm text-[var(--muted-foreground)]">
        Demo application — no real transactions processed
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
