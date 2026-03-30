import { getEvents } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function EventsPage() {
  let events: { data: Array<{ id: string; title: string; status: string; startDate: string; price: string }> } = { data: [] };
  try {
    events = await getEvents();
  } catch {
    // Handle auth redirect
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.data.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>
                <Badge variant={event.status === 'PUBLISHED' ? 'default' : event.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
              <TableCell>${event.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
