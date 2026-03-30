import { fetchEvents } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function EventsPage() {
  const { data, error } = await fetchEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
      </div>
      {error && (
        <div role="alert" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Max Attendees</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((event: { id: string; title: string; status: string; startDate: string; maxAttendees: number }) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell><Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>{event.status}</Badge></TableCell>
              <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
              <TableCell>{event.maxAttendees}</TableCell>
            </TableRow>
          )) ?? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">No events found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
