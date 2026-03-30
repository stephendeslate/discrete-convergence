// TRACED:EM-FE-010
'use client';

interface VenueItem {
  id: string;
  name: string;
  city: string;
  capacity: number;
}

export function VenueList({ venues = [] }: { venues?: VenueItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-white">Your Venues</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {venues.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400">
            No venues found. Create one above.
          </div>
        ) : (
          venues.map((venue) => (
            <div key={venue.id} className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold dark:text-white">{venue.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{venue.city}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Capacity: {venue.capacity}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
