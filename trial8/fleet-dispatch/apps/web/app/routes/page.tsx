import { fetchRoutes } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default async function RoutesPage() {
  const routes = await fetchRoutes();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Routes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Duration (min)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.data.map((r: { id: string; name: string; origin: string; destination: string; distance: number; estimatedDuration: number }) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.origin}</TableCell>
              <TableCell>{r.destination}</TableCell>
              <TableCell>{r.distance}</TableCell>
              <TableCell>{r.estimatedDuration}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
