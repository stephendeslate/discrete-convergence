import { getVenues } from '@/lib/actions';

export default async function VenuesPage() {
  const result = await getVenues();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Venues</h1>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((venue: { id: string; name: string; city: string; capacity: number }) => (
              <tr key={venue.id} className="border-b border-[var(--border)]">
                <td className="p-3">{venue.name}</td>
                <td className="p-3">{venue.city}</td>
                <td className="p-3">{venue.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
