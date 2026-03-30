import { getEvents } from '@/lib/actions';

export default async function EventsPage() {
  const result = await getEvents();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Events</h1>
      <a href="/events/new" className="inline-block mb-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded">
        Create Event
      </a>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Start Date</th>
              <th className="text-left p-3">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((event: { id: string; title: string; status: string; startDate: string; capacity: number }) => (
              <tr key={event.id} className="border-b border-[var(--border)]">
                <td className="p-3">{event.title}</td>
                <td className="p-3">{event.status}</td>
                <td className="p-3">{new Date(event.startDate).toLocaleDateString()}</td>
                <td className="p-3">{event.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Page {result.page} &middot; {result.total} total
      </p>
    </div>
  );
}
