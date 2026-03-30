import { getVenues } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default async function VenuesPage() {
  let venues: { data: Array<{ id: string; name: string; address: string; capacity: number }> } = { data: [] };
  try {
    venues = await getVenues();
  } catch {
    // Handle auth redirect
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Venues</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Capacity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.data.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell className="font-medium">{venue.name}</TableCell>
              <TableCell>{venue.address}</TableCell>
              <TableCell>{venue.capacity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
