import { fetchVehicles } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// TRACED: FD-VEH-001
export default async function VehiclesPage() {
  const result = await fetchVehicles();
  const vehicles = result.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <Badge variant="outline">{result.total ?? 0} total</Badge>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Make / Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mileage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                  No vehicles found
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v: Record<string, string | number>) => (
                <TableRow key={String(v.id)}>
                  <TableCell>{String(v.name)}</TableCell>
                  <TableCell>{String(v.licensePlate)}</TableCell>
                  <TableCell>{String(v.make)} {String(v.model)}</TableCell>
                  <TableCell><Badge variant={v.status === 'AVAILABLE' ? 'success' : 'default'}>{String(v.status)}</Badge></TableCell>
                  <TableCell>{String(v.mileage)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
