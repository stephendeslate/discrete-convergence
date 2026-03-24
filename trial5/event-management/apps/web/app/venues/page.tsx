import { fetchVenues, getSession } from '@/lib/actions';
import { Card } from '@/components/card';
import { Navigation } from '@/components/navigation';

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const session = await getSession();

  let venues;
  try {
    venues = await fetchVenues(page);
  } catch {
    venues = { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
  }

  return (
    <div className="min-h-screen">
      <Navigation role={session?.role ?? 'VIEWER'} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Venues</h1>
        {venues.data.length === 0 ? (
          <p className="text-gray-500">No venues found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {venues.data.map((venue) => (
              <Card key={venue.id} className="p-4">
                <h2 className="text-lg font-semibold">{venue.name}</h2>
                <p className="text-sm text-gray-600">{venue.address}</p>
                <p className="mt-2 text-sm text-gray-400">Capacity: {venue.capacity}</p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
