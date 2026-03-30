// TRACED:WEB-EVENT-LIST
'use client';

import { useState, useEffect } from 'react';
import { fetchEvents } from '@/lib/api';
import type { EventItem } from '@/lib/api';
import { cn } from '@/lib/utils';

export function EventList() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setError('Please log in to view events');
      setLoading(false);
      return;
    }

    fetchEvents(token)
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading events...</div>;
  }

  if (error) {
    return (
      <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/30 dark:border-red-800')}>
        <p className={cn('text-red-700 dark:text-red-400')}>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return <p className={cn('text-gray-500 dark:text-gray-400')}>No events found. Create your first event above.</p>;
  }

  return (
    <div className={cn('space-y-4')}>
      <h2 className={cn('text-lg font-semibold dark:text-white')}>Your Events</h2>
      <div className={cn('grid gap-4')}>
        {events.map((event) => (
          <div key={event.id} className={cn('bg-white rounded-lg shadow p-4 dark:bg-gray-800')}>
            <div className="flex items-center justify-between">
              <h3 className={cn('font-semibold text-gray-900 dark:text-white')}>{event.title}</h3>
              <span className={cn(
                'px-2 py-1 text-xs rounded-full',
                event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                event.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
              )}>
                {event.status}
              </span>
            </div>
            {event.description && (
              <p className={cn('text-gray-600 text-sm mt-1 dark:text-gray-400')}>{event.description}</p>
            )}
            <div className={cn('flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400')}>
              <span>Start: {new Date(event.startDate).toLocaleDateString()}</span>
              <span>End: {new Date(event.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
