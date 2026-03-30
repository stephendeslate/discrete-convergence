// TRACED:WEB-VENUE-LIST
'use client';

import { useState, useEffect } from 'react';
import { fetchVenues } from '@/lib/api';
import type { VenueItem } from '@/lib/api';
import { cn } from '@/lib/utils';

export function VenueList() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setError('Please log in to view venues');
      setLoading(false);
      return;
    }

    fetchVenues(token)
      .then((res) => {
        setVenues(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load venues');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading venues...</div>;
  }

  if (error) {
    return (
      <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/30 dark:border-red-800')}>
        <p className={cn('text-red-700 dark:text-red-400')}>{error}</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return <p className={cn('text-gray-500 dark:text-gray-400')}>No venues found. Create your first venue above.</p>;
  }

  return (
    <div className={cn('space-y-4')}>
      <h2 className={cn('text-lg font-semibold dark:text-white')}>Your Venues</h2>
      <div className={cn('grid gap-4')}>
        {venues.map((venue) => (
          <div key={venue.id} className={cn('bg-white rounded-lg shadow p-4 dark:bg-gray-800')}>
            <h3 className={cn('font-semibold text-gray-900 dark:text-white')}>{venue.name}</h3>
            <p className={cn('text-gray-600 text-sm mt-1 dark:text-gray-400')}>{venue.address}</p>
            <p className={cn('text-gray-500 text-xs mt-1 dark:text-gray-400')}>Capacity: {venue.capacity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
