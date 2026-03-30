// TRACED: FD-UI-007
import { getDispatches } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Dispatch {
  id: string;
  origin: string;
  destination: string;
  status: string;
  scheduledAt: string;
  cost: number;
  vehicle?: { name: string };
  driver?: { name: string };
}

export default async function DispatchesPage() {
  let dispatches: Dispatch[] = [];
  try {
    dispatches = await getDispatches();
  } catch {
    dispatches = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dispatches</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dispatches.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.vehicle?.name ?? 'N/A'}</TableCell>
              <TableCell>{d.driver?.name ?? 'N/A'}</TableCell>
              <TableCell>{d.origin}</TableCell>
              <TableCell>{d.destination}</TableCell>
              <TableCell>
                <Badge variant={d.status === 'COMPLETED' ? 'default' : d.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                  {d.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(d.scheduledAt).toLocaleDateString()}</TableCell>
              <TableCell>${Number(d.cost).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
