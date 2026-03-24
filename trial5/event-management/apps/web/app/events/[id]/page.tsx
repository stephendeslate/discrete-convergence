import { fetchEvent } from '@/lib/actions';
import { Card } from '@/components/card';
import { Navigation } from '@/components/navigation';
import { getSession } from '@/lib/actions';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  let event;
  try {
    event = await fetchEvent(id);
  } catch {
    return (
      <div className="min-h-screen">
        <Navigation role={session?.role ?? 'VIEWER'} />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-red-600">Event not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation role={session?.role ?? 'VIEWER'} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <a href="/events" className="text-sm text-blue-600 hover:underline">&larr; Back to events</a>
        <h1 className="mt-4 text-3xl font-bold">{event.title}</h1>
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
        <p className="mt-4 text-gray-600">{event.description ?? 'No description'}</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>{new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</p>
          {event.venue && <p className="mt-1">Venue: {event.venue.name} ({event.venue.address})</p>}
        </div>

        <h2 className="mt-8 text-xl font-semibold">Tickets</h2>
        {event.tickets.length === 0 ? (
          <p className="text-gray-500">No tickets available.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {event.tickets.map((ticket) => (
              <Card key={ticket.id} className="p-4">
                <h3 className="font-medium">{ticket.type}</h3>
                <p className="text-lg font-bold">${ticket.price}</p>
                <p className="text-sm text-gray-500">{ticket.sold} / {ticket.quantity} sold</p>
              </Card>
            ))}
          </div>
        )}

        <h2 className="mt-8 text-xl font-semibold">Attendees</h2>
        {event.attendees.length === 0 ? (
          <p className="text-gray-500">No attendees registered.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {event.attendees.map((attendee) => (
                <tr key={attendee.id} className="border-b">
                  <td className="py-2">{attendee.name}</td>
                  <td className="py-2">{attendee.email}</td>
                  <td className="py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${
                      attendee.checkInStatus === 'CHECKED_IN' ? 'bg-green-100 text-green-800' :
                      attendee.checkInStatus === 'NO_SHOW' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {attendee.checkInStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
