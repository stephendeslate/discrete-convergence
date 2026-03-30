import { fetchVenues } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function VenuesPage() {
  const { data, error } = await fetchVenues();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Venues</h1>
      {error && (
        <div role="alert" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Capacity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((venue: { id: string; name: string; address: string; capacity: number }) => (
            <TableRow key={venue.id}>
              <TableCell className="font-medium">{venue.name}</TableCell>
              <TableCell>{venue.address}</TableCell>
              <TableCell>{venue.capacity}</TableCell>
            </TableRow>
          )) ?? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">No venues found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
