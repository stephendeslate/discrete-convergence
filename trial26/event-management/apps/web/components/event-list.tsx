// TRACED:EM-FE-010
'use client';

import { deleteEvent } from '../lib/actions';

interface EventItem {
  id: string;
  title: string;
  status: string;
  startDate: string;
  capacity: number;
}

export function EventList({ events = [] }: { events?: EventItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-white">Your Events</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400">
            No events found. Create one above.
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold dark:text-white">{event.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status: {event.status}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Capacity: {event.capacity}</p>
              <button
                onClick={() => deleteEvent(event.id)}
                className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
