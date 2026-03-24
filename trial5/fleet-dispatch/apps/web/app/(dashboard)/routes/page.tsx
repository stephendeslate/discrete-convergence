import { fetchRoutes } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default async function RoutesPage(): Promise<React.JSX.Element> {
  let routes;
  let error: string | null = null;
  try {
    routes = await fetchRoutes();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load routes';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Routes</h1>
      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Routes ({routes?.meta.total ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Est. Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes?.data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.origin}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.destination}</TableCell>
                    <TableCell>{Number(r.distanceKm).toFixed(1)} km</TableCell>
                    <TableCell>{r.estimatedMinutes} min</TableCell>
                  </TableRow>
                ))}
                {routes?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No routes found
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
