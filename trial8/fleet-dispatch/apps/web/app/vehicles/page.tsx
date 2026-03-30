import { fetchVehicles } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function VehiclesPage() {
  const vehicles = await fetchVehicles();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Vehicles</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>VIN</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mileage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.data.map((v: { id: string; vin: string; make: string; model: string; year: number; status: string; mileage: number }) => (
            <TableRow key={v.id}>
              <TableCell>{v.vin}</TableCell>
              <TableCell>{v.make}</TableCell>
              <TableCell>{v.model}</TableCell>
              <TableCell>{v.year}</TableCell>
              <TableCell>
                <Badge variant={v.status === 'ACTIVE' ? 'success' : v.status === 'RETIRED' ? 'destructive' : 'warning'}>
                  {v.status}
                </Badge>
              </TableCell>
              <TableCell>{v.mileage.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
