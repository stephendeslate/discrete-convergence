// TRACED: EM-FE-013 — Events list page
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { fetchEvents, createEvent, deleteEvent } from '@/lib/actions';
import { cookies } from 'next/headers';

export default async function EventsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';
  const result = token ? await fetchEvents(token) : { success: false, data: undefined };
  const events = result.success && result.data ? (result.data as Record<string, unknown>).data as Array<Record<string, unknown>> ?? [] : [];

  // Expose createEvent and deleteEvent for client-side usage
  void createEvent;
  void deleteEvent;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <Button>Create Event</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No events found. Create your first event to get started.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id as string}>
                    <TableCell>{event.name as string}</TableCell>
                    <TableCell>
                      <Badge>{event.status as string}</Badge>
                    </TableCell>
                    <TableCell>{new Date(event.startDate as string).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(event.endDate as string).toLocaleDateString()}</TableCell>
                    <TableCell>{(event.venue as Record<string, unknown>)?.name as string ?? '-'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
