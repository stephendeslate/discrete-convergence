import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        Event Management Platform
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl text-center">
        Create and manage events, venues, attendees, and registrations with
        multi-tenant support and role-based access control.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="default" size="lg">
            Sign In
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" size="lg">
            Register
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full max-w-4xl">
        {[
          { title: 'Events', desc: 'Create and manage events', href: '/events' },
          { title: 'Venues', desc: 'Manage event venues', href: '/venues' },
          { title: 'Attendees', desc: 'Track attendee records', href: '/attendees' },
          { title: 'Registrations', desc: 'Handle event sign-ups', href: '/registrations' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors">
              <h2 className="font-semibold text-lg">{item.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
