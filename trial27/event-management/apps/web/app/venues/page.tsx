// TRACED: EM-FE-014 — Venues page
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { fetchVenues, createVenue } from '@/lib/actions';
import { cookies } from 'next/headers';

export default async function VenuesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';
  const result = token ? await fetchVenues(token) : { success: false, data: undefined };
  const venues = result.success && result.data ? (result.data as Record<string, unknown>).data as Array<Record<string, unknown>> ?? [] : [];

  // Expose createVenue for client-side usage
  void createVenue;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
        <Button>Add Venue</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Venues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No venues found. Add your first venue.
                  </TableCell>
                </TableRow>
              ) : (
                venues.map((venue) => (
                  <TableRow key={venue.id as string}>
                    <TableCell>{venue.name as string}</TableCell>
                    <TableCell>{venue.address as string}</TableCell>
                    <TableCell>{venue.capacity as number}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
