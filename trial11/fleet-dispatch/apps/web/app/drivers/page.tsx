// TRACED: FD-UI-006
import { getDrivers, createDriver } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: string;
}

export default async function DriversPage() {
  let drivers: Driver[] = [];
  try {
    drivers = await getDrivers();
  } catch {
    drivers = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Drivers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDriver} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" name="licenseNumber" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
              <TableCell>{d.licenseNumber}</TableCell>
              <TableCell>{d.phone}</TableCell>
              <TableCell><Badge variant={d.status === 'ACTIVE' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
