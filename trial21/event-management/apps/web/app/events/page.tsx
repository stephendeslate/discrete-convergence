export const dynamic = 'force-dynamic';

import { fetchEvents } from '@/lib/actions';

/** TRACED:EM-FE-008 — Event list and builder page */
export default async function EventsPage() {
  const { data: events } = await fetchEvents();

  return (
    <section>
      <h1>Events</h1>
      <h2>Event List</h2>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={String(event['id'])}>
                <td>{String(event['title'])}</td>
                <td>{String(event['status'])}</td>
                <td>{String(event['startDate'])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
