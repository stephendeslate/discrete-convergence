'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchVenues } from '@/lib/actions';

interface Venue {
  id: string;
  name: string;
  address: string | null;
  capacity: number;
}

export default function VenueList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues()
      .then((res) => setVenues(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading venues...</p>;

  if (venues.length === 0) {
    return <p className="text-gray-500">No venues found.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue) => (
        <Card key={venue.id}>
          <CardHeader>
            <CardTitle className="text-base">{venue.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {venue.address && <p className="text-sm text-gray-500">{venue.address}</p>}
            <p className="text-sm text-gray-500">Capacity: {venue.capacity}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
