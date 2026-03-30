import { fetchVehicles } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';

export default async function FleetPage(): Promise<React.JSX.Element> {
  let vehicles;
  let error: string | null = null;
  try {
    vehicles = await fetchVehicles();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load vehicles';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fleet Overview</h1>
      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{vehicles?.meta.total ?? 0}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Vehicles</CardTitle>
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
                      <TableCell className="font-medium">{v.licensePlate}</TableCell>
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
        </>
      )}
    </div>
  );
}
