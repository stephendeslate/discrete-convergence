import { getEvent } from '@/lib/actions';
import { redirect } from 'next/navigation';

interface Schedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string | null;
  speaker: string | null;
}

interface Ticket {
  id: string;
  type: string;
  price: string;
  status: string;
}

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  venue?: { name: string; address: string; city: string } | null;
  schedules?: Schedule[];
  tickets?: Ticket[];
}

// TRACED: EM-UI-007 — Event detail page
export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEvent(id);

  if (result && 'error' in result) {
    if (result.status === 401) {
      redirect('/login');
    }
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Event not found</p>
        <a href="/events" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to events
        </a>
      </div>
    );
  }

  const event = result as EventDetail;

  return (
    <div>
      <a href="/events" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        &larr; Back to events
      </a>

      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                event.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-700'
                  : event.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>

        {event.description && (
          <p className="mb-6 text-gray-700">{event.description}</p>
        )}

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
            <p>{new Date(event.startDate).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">End Date</h3>
            <p>{new Date(event.endDate).toLocaleString()}</p>
          </div>
        </div>

        {event.venue && (
          <div className="mb-6 rounded bg-gray-50 p-4">
            <h3 className="font-medium mb-1">Venue</h3>
            <p className="text-sm text-gray-700">{event.venue.name}</p>
            <p className="text-sm text-gray-500">{event.venue.address}, {event.venue.city}</p>
          </div>
        )}

        {event.schedules && event.schedules.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Schedule</h3>
            <div className="space-y-2">
              {event.schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded border p-3 text-sm">
                  <div>
                    <p className="font-medium">{s.title}</p>
                    {s.speaker && <p className="text-gray-500">Speaker: {s.speaker}</p>}
                  </div>
                  <div className="text-right text-gray-500">
                    <p>{new Date(s.startTime).toLocaleTimeString()} - {new Date(s.endTime).toLocaleTimeString()}</p>
                    {s.room && <p>{s.room}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.tickets && event.tickets.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Tickets</h3>
            <div className="grid gap-2 md:grid-cols-3">
              {event.tickets.map((t) => (
                <div key={t.id} className="rounded border p-3 text-sm">
                  <p className="font-medium">{t.type}</p>
                  <p className="text-gray-700">${t.price}</p>
                  <span
                    className={`text-xs ${
                      t.status === 'AVAILABLE' ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
