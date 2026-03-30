import { fetchDrivers } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function DriversPage() {
  const drivers = await fetchDrivers();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Drivers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Certifications</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.data.map((d: { id: string; name: string; licenseNumber: string; status: string; certifications: string[] }) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
              <TableCell>{d.licenseNumber}</TableCell>
              <TableCell>
                <Badge variant={d.status === 'ACTIVE' ? 'success' : d.status === 'TERMINATED' ? 'destructive' : 'warning'}>
                  {d.status}
                </Badge>
              </TableCell>
              <TableCell>{d.certifications.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
