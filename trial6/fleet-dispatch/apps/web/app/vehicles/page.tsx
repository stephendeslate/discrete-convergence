import Link from 'next/link';
import { fetchVehicles } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Nav } from '@/components/nav';

export default async function VehiclesPage(): Promise<React.JSX.Element> {
  let vehicles;
  let error: string | null = null;
  try {
    vehicles = await fetchVehicles();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load vehicles';
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Vehicles</h1>
          {error ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Vehicles ({vehicles?.meta.total ?? 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate</TableHead>
                      <TableHead>Make / Model</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mileage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles?.data.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Link href={`/vehicles/${v.id}`} className="font-medium underline">
                            {v.licensePlate}
                          </Link>
                        </TableCell>
                        <TableCell>{v.make} {v.model}</TableCell>
                        <TableCell>{v.year}</TableCell>
                        <TableCell><StatusBadge status={v.status} /></TableCell>
                        <TableCell>{Number(v.mileage).toLocaleString()} km</TableCell>
                      </TableRow>
                    ))}
                    {vehicles?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No vehicles found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
