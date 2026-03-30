import { fetchRoutes } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// TRACED: FD-ROUTE-001
export default async function RoutesPage() {
  const result = await fetchRoutes();
  const routes = result.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Routes</h1>
        <Badge variant="outline">{result.total ?? 0} total</Badge>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                  No routes found
                </TableCell>
              </TableRow>
            ) : (
              routes.map((r: Record<string, string | number>) => (
                <TableRow key={String(r.id)}>
                  <TableCell>{String(r.name)}</TableCell>
                  <TableCell>{String(r.origin)}</TableCell>
                  <TableCell>{String(r.destination)}</TableCell>
                  <TableCell>{String(r.distanceMiles)} mi</TableCell>
                  <TableCell><Badge variant={r.status === 'ACTIVE' ? 'success' : 'default'}>{String(r.status)}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
