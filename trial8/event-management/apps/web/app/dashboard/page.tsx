import { getEvents } from '@/lib/actions';
import { redirect } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
}

// TRACED: EM-UI-005 — Dashboard page showing events summary
export default async function DashboardPage() {
  const result = await getEvents(1, 10);

  if (result && 'error' in result && result.status === 401) {
    redirect('/login');
  }

  const events: Event[] = result?.data ?? [];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <h2 className="text-sm font-medium text-gray-500">Total Events</h2>
          <p className="text-3xl font-bold text-indigo-600">{result?.total ?? 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <h2 className="text-sm font-medium text-gray-500">Published</h2>
          <p className="text-3xl font-bold text-green-600">
            {events.filter((e) => e.status === 'PUBLISHED').length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <h2 className="text-sm font-medium text-gray-500">Draft</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {events.filter((e) => e.status === 'DRAFT').length}
          </p>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Recent Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">No events yet. Create your first event.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{event.title}</td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">{new Date(event.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <a href={`/events/${event.id}`} className="text-indigo-600 hover:underline">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
