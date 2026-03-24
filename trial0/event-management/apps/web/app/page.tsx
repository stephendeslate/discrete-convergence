import { APP_VERSION } from '@event-management/shared';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <h1 className="text-4xl font-bold">Event Management Platform</h1>
      <p className="text-[var(--muted-foreground)] text-lg">
        Create, manage, and discover events. Version {APP_VERSION}
      </p>
      <div className="flex gap-4">
        <Link href="/discover">
          <Button size="lg">Discover Events</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
