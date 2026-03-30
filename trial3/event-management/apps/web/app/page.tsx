import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Event Management Platform</h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Create, manage, and attend events with ease. Demo application — no real transactions processed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Organize Events</CardTitle>
            <CardDescription>Create and manage your events with sessions, tickets, and venues</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/events">
              <Button variant="outline" className="w-full">View Events</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Venues</CardTitle>
            <CardDescription>Physical and virtual venues with capacity management</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/venues">
              <Button variant="outline" className="w-full">View Venues</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Registrations</CardTitle>
            <CardDescription>Monitor attendee registrations and check-in status</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/registrations">
              <Button variant="outline" className="w-full">View Registrations</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/public-events">
          <Button size="lg">Browse Public Events</Button>
        </Link>
      </div>
    </div>
  );
}
