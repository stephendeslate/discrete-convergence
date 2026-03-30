import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-4xl font-bold text-[var(--foreground)]">Event Management Platform</h1>
      <p className="text-lg text-[var(--muted-foreground)] max-w-md text-center">
        Manage events, venues, attendees, and registrations in a multi-tenant environment.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}
