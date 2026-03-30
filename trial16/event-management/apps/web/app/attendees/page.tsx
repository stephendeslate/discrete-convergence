import { getAttendees } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface AttendeeItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export default async function AttendeesPage() {
  const result = await getAttendees();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendees</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.data?.map((attendee: AttendeeItem) => (
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
