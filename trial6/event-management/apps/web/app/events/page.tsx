import { fetchEvents, getSession } from '@/lib/actions';
import { Card } from '@/components/card';
import { Navigation } from '@/components/navigation';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const session = await getSession();

  let events;
  try {
    events = await fetchEvents(page);
  } catch {
    events = { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
  }

  return (
    <div className="min-h-screen">
      <Navigation role={session?.role ?? 'VIEWER'} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events</h1>
          {(session?.role === 'ADMIN' || session?.role === 'ORGANIZER') && (
            <a
              href="/events/new"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create Event
            </a>
          )}
        </div>
        {events.data.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.data.map((event) => (
              <a key={event.id} href={`/events/${event.id}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <h2 className="text-lg font-semibold">{event.title}</h2>
                  <p className="text-sm text-gray-600">{event.description ?? 'No description'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </Card>
              </a>
            ))}
          </div>
        )}
        {events.meta.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {page > 1 && (
              <a href={`/events?page=${page - 1}`} className="rounded border px-3 py-1">Previous</a>
            )}
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {events.meta.page} of {events.meta.totalPages}
            </span>
            {page < events.meta.totalPages && (
              <a href={`/events?page=${page + 1}`} className="rounded border px-3 py-1">Next</a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
