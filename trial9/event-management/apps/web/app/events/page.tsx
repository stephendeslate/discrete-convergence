import { getEvents } from '../../lib/actions';

export default async function EventsPage() {
  const data = await getEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Events</h1>
      <div className="space-y-4">
        {data.items.map((event: { id: string; title: string; status: string; startDate: string }) => (
          <div key={event.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Status: {event.status} | Start: {new Date(event.startDate).toLocaleDateString()}
            </p>
          </div>
        ))}
        {data.items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">No events found.</p>
        )}
      </div>
    </div>
  );
}
