import { fetchAttendees } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function AttendeesPage() {
  const { data, error } = await fetchAttendees();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendees</h1>
      {error && (
        <div role="alert" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((attendee: { id: string; firstName: string; lastName: string; email: string; phone?: string }) => (
            <TableRow key={attendee.id}>
              <TableCell className="font-medium">{attendee.firstName} {attendee.lastName}</TableCell>
              <TableCell>{attendee.email}</TableCell>
              <TableCell>{attendee.phone || '--'}</TableCell>
            </TableRow>
          )) ?? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">No attendees found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
