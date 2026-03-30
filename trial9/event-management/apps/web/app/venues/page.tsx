import { getVenues } from '../../lib/actions';

export default async function VenuesPage() {
  const data = await getVenues();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Venues</h1>
      <div className="space-y-4">
        {data.items.map((venue: { id: string; name: string; address: string; capacity: number }) => (
          <div key={venue.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="text-lg font-semibold">{venue.name}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {venue.address} | Capacity: {venue.capacity}
            </p>
          </div>
        ))}
        {data.items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">No venues found.</p>
        )}
      </div>
    </div>
  );
}
