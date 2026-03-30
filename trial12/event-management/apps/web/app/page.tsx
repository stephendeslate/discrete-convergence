import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Event Management Platform
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Manage conferences, meetups, and events with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create and manage your events, track status, and set capacity.
            </p>
            <Link href="/events">
              <Button>View Events</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Manage venue information, capacity, and availability.
            </p>
            <Link href="/venues">
              <Button>View Venues</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Handle ticket sales, pricing, and refunds.
            </p>
            <Link href="/tickets">
              <Button>View Tickets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
