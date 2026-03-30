import { getAttendees } from '@/lib/actions';

export default async function AttendeesPage() {
  const result = await getAttendees();
  const attendees = result?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Attendees</h1>
      {attendees.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No attendees found.</p>
      ) : (
        <ul role="list" className="space-y-4">
          {attendees.map((attendee: { id: string; name: string; email: string }) => (
            <li key={attendee.id} className="border border-[var(--border)] rounded-lg p-4">
              <h2 className="text-lg font-semibold">{attendee.name}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{attendee.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
