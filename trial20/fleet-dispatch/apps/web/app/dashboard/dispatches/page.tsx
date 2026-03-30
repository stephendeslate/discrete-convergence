import { fetchDispatches } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// TRACED: FD-DISP-001
export default async function DispatchesPage() {
  const result = await fetchDispatches();
  const dispatches = result.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatches</h1>
        <Badge variant="outline">{result.total ?? 0} total</Badge>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheduled At</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dispatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                  No dispatches found
                </TableCell>
              </TableRow>
            ) : (
              dispatches.map((d: Record<string, unknown>) => (
                <TableRow key={String(d.id)}>
                  <TableCell>{String(d.scheduledAt)}</TableCell>
                  <TableCell>{d.vehicle ? String((d.vehicle as Record<string, string>).name) : '-'}</TableCell>
                  <TableCell>{d.route ? String((d.route as Record<string, string>).name) : '-'}</TableCell>
                  <TableCell>{d.driver ? String((d.driver as Record<string, string>).name) : '-'}</TableCell>
                  <TableCell><Badge variant={d.status === 'COMPLETED' ? 'success' : 'default'}>{String(d.status)}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
