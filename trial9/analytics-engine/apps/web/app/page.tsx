import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <h1 className="text-4xl font-bold text-[var(--foreground)]">
        Analytics Engine
      </h1>
      <p className="text-lg text-[var(--muted-foreground)] max-w-md text-center">
        Build and manage data dashboards with powerful visualization widgets
        and multiple data source connections.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)]"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
