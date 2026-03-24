import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link href="/" className="font-bold text-lg">Event Manager</Link>
        <Link href="/events" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Events</Link>
        <Link href="/venues" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Venues</Link>
        <Link href="/discover" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Discover</Link>
        <div className="ml-auto flex gap-4">
          <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Sign In</Link>
        </div>
      </div>
    </nav>
  );
}
