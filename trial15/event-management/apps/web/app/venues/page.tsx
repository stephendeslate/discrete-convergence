import { getVenues } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface VenueItem {
  id: string;
  name: string;
  address: string;
  capacity: number;
}

export default async function VenuesPage() {
  const result = await getVenues();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Venues</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Capacity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.data?.map((venue: VenueItem) => (
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
