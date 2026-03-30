import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">Fleet Dispatch</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Fleet management and vehicle dispatch platform
      </p>
      <div className="flex justify-center gap-4">
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
