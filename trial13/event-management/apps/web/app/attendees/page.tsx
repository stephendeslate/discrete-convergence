import { getAttendees } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default async function AttendeesPage() {
  let attendees: { data: Array<{ id: string; name: string; email: string; phone: string | null }> } = { data: [] };
  try {
    attendees = await getAttendees();
  } catch {
    // Handle auth redirect
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Attendees</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendees.data.map((attendee) => (
            <TableRow key={attendee.id}>
              <TableCell className="font-medium">{attendee.name}</TableCell>
              <TableCell>{attendee.email}</TableCell>
              <TableCell>{attendee.phone ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
