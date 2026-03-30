import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getEvents, getVenues, getAttendees } from '@/lib/actions';

export default async function DashboardPage() {
  let eventCount = 0;
  let venueCount = 0;
  let attendeeCount = 0;

  try {
    const [events, venues, attendees] = await Promise.all([
      getEvents(1, 1),
      getVenues(1, 1),
      getAttendees(1, 1),
    ]);
    eventCount = events.total;
    venueCount = venues.total;
    attendeeCount = attendees.total;
  } catch {
    // Data will show 0 on error
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{eventCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{venueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{attendeeCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
