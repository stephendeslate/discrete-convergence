import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

async function getVenues(): Promise<Array<{
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
}>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/venues`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to load venues');
  }
  const body = await res.json();
  return body.data ?? [];
}

export default async function VenuesPage() {
  const venues = await getVenues();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Venues</h1>
        <Button asChild>
          <a href="/venues/new">Add Venue</a>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Venue Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {venues.length === 0 ? (
            <p className="text-[var(--muted-foreground)] py-8 text-center">No venues added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>{venue.address}</TableCell>
                    <TableCell>{venue.city}</TableCell>
                    <TableCell>{venue.capacity.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
