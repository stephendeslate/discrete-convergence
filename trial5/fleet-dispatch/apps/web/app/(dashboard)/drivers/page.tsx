import Link from 'next/link';
import { fetchDrivers } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function DriversPage(): Promise<React.JSX.Element> {
  let drivers;
  let error: string | null = null;
  try {
    drivers = await fetchDrivers();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load drivers';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Drivers</h1>
      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Drivers ({drivers?.meta.total ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers?.data.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link href={`/drivers/${d.id}`} className="font-medium underline">
                        {d.name}
                      </Link>
                    </TableCell>
                    <TableCell>{d.licenseNumber}</TableCell>
                    <TableCell>{d.phone}</TableCell>
                    <TableCell>
                      <Badge variant={d.available ? 'success' : 'outline'}>
                        {d.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {drivers?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No drivers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
