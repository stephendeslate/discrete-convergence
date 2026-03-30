import { getEvents } from '@/lib/actions';

export default async function EventsPage() {
  const result = await getEvents();
  const events = result?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      {events.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No events found.</p>
      ) : (
        <ul role="list" className="space-y-4">
          {events.map((event: { id: string; title: string; status: string; startDate: string }) => (
            <li key={event.id} className="border border-[var(--border)] rounded-lg p-4">
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Status: {event.status} | Start: {new Date(event.startDate).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
