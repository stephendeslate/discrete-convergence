import { fetchRegistrations } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function RegistrationsPage() {
  const { data, error } = await fetchRegistrations();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Registrations</h1>
      {error && (
        <div role="alert" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Attendee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((reg: { id: string; eventId: string; attendeeId: string; status: string; createdAt: string }) => (
            <TableRow key={reg.id}>
              <TableCell>{reg.eventId}</TableCell>
              <TableCell>{reg.attendeeId}</TableCell>
              <TableCell>
                <Badge variant={reg.status === 'CONFIRMED' ? 'default' : reg.status === 'WAITLISTED' ? 'secondary' : 'destructive'}>
                  {reg.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(reg.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          )) ?? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">No registrations found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
