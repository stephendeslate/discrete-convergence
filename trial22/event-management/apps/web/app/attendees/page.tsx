import { getAttendees } from '@/lib/actions';

export default async function AttendeesPage() {
  const result = await getAttendees();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Attendees</h1>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((attendee: { id: string; name: string; email: string }) => (
              <tr key={attendee.id} className="border-b border-[var(--border)]">
                <td className="p-3">{attendee.name}</td>
                <td className="p-3">{attendee.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
