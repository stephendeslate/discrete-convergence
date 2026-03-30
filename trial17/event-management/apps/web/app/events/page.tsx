import { getEvents } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface EventItem {
  id: string;
  title: string;
  date: string;
  status: string;
  capacity: number;
}

export default async function EventsPage() {
  const result = await getEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Events</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Capacity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.data?.map((event: EventItem) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={event.status === 'CANCELLED' ? 'destructive' : 'default'}>
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell>{event.capacity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
