import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getEvents, getVenues, getAttendees, getRegistrations } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';

export default async function DashboardPage() {
  const [events, venues, attendees, registrations] = await Promise.all([
    getEvents(),
    getVenues(),
    getAttendees(),
    getRegistrations(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Separator />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{events.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{venues.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{attendees.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{registrations.total ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
