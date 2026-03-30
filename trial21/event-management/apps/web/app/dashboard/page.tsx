export const dynamic = 'force-dynamic';

import { fetchEvents } from '@/lib/actions';

/** TRACED:EM-FE-007 — Admin dashboard */
export default async function DashboardPage() {
  const { data: events, total } = await fetchEvents();

  return (
    <section>
      <h1>Dashboard</h1>
      <h2>Your Events ({total})</h2>
      {events.length === 0 ? (
        <p>No events yet. Create your first event.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={String(event['id'])}>
              <a href={`/events`}>{String(event['title'])}</a>
            </li>
          ))}
        </ul>
      )}
      <a href="/events">Manage Events</a>
    </section>
  );
}
