import { fetchTrips } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function TripsPage() {
  const trips = await fetchTrips();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Trips</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.data.map((t: { id: string; status: string; startTime: string | null; endTime: string | null }) => (
            <TableRow key={t.id}>
              <TableCell>
                <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'CANCELLED' ? 'destructive' : 'default'}>
                  {t.status}
                </Badge>
              </TableCell>
              <TableCell>{t.startTime ?? '-'}</TableCell>
              <TableCell>{t.endTime ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
