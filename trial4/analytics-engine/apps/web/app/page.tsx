import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-4xl font-bold">Analytics Engine</h1>
      <p className="text-lg text-[var(--muted-foreground)] max-w-md text-center">
        Build, customize, and embed analytics dashboards for your SaaS product.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
