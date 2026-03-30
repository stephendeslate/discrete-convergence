import { getEvents } from '@/lib/actions';
import { redirect } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  venue?: { name: string } | null;
}

// TRACED: EM-UI-006 — Events list page with pagination
export default async function EventsPage() {
  const result = await getEvents(1, 20);

  if (result && 'error' in result && result.status === 401) {
    redirect('/login');
  }

  const events: Event[] = result?.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <a
              key={event.id}
              href={`/events/${event.id}`}
              className="block rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="mb-2 text-lg font-semibold">{event.title}</h2>
              {event.description && (
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">{event.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    event.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700'
                      : event.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {event.status}
                </span>
                <span className="text-gray-500">
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
              </div>
              {event.venue && (
                <p className="mt-2 text-xs text-gray-500">{event.venue.name}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
