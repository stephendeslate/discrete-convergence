import { getVenues } from '@/lib/actions';

export default async function VenuesPage() {
  const result = await getVenues();
  const venues = result?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Venues</h1>
      {venues.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No venues found.</p>
      ) : (
        <ul role="list" className="space-y-4">
          {venues.map((venue: { id: string; name: string; address: string; capacity: number }) => (
            <li key={venue.id} className="border border-[var(--border)] rounded-lg p-4">
              <h2 className="text-lg font-semibold">{venue.name}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {venue.address} | Capacity: {venue.capacity}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
