import { fetchMaintenance } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function MaintenancePage() {
  const records = await fetchMaintenance();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Maintenance</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.data.map((m: { id: string; type: string; cost: number; date: string; notes: string | null }) => (
            <TableRow key={m.id}>
              <TableCell>
                <Badge variant={m.type === 'EMERGENCY' ? 'destructive' : m.type === 'UNSCHEDULED' ? 'warning' : 'default'}>
                  {m.type}
                </Badge>
              </TableCell>
              <TableCell>${Number(m.cost).toFixed(2)}</TableCell>
              <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
              <TableCell>{m.notes ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
