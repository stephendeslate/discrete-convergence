import { fetchDrivers } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// TRACED: FD-DRV-001
export default async function DriversPage() {
  const result = await fetchDrivers();
  const drivers = result.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Badge variant="outline">{result.total ?? 0} total</Badge>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((d: Record<string, string | number>) => (
                <TableRow key={String(d.id)}>
                  <TableCell>{String(d.name)}</TableCell>
                  <TableCell>{String(d.licenseNumber)}</TableCell>
                  <TableCell>{String(d.phone)}</TableCell>
                  <TableCell><Badge variant={d.status === 'AVAILABLE' ? 'success' : 'default'}>{String(d.status)}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
