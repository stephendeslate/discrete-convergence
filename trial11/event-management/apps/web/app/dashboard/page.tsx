import { getEvents } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED: EM-UI-006
export default async function DashboardPage() {
  const eventsData = await getEvents();
  const events = eventsData?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{events.length}</CardTitle>
            <CardDescription>Total Events</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {events.filter((e: { status: string }) => e.status === 'PUBLISHED').length}
            </CardTitle>
            <CardDescription>Published Events</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {events.filter((e: { status: string }) => e.status === 'DRAFT').length}
            </CardTitle>
            <CardDescription>Draft Events</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Recent Events</h2>
        {events.map((event: { id: string; title: string; status: string; startDate: string }) => (
          <Card key={event.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">{new Date(event.startDate).toLocaleDateString()}</p>
              </div>
              <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
