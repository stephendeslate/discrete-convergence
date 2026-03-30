import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold">Fleet Dispatch</h1>
      <p className="text-lg text-[var(--muted-foreground)]">
        Manage your fleet, drivers, and dispatches efficiently
      </p>
      <div className="flex space-x-4">
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
