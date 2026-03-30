import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Event Management Platform</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Create and manage events with scheduling, ticketing, and check-in.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage venues with capacity tracking and event assignments.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Track attendee registrations, ticket sales, and check-ins.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
