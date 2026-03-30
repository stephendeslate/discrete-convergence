export const dynamic = 'force-dynamic';

import { fetchPublicEvents } from '@/lib/actions';

/** TRACED:EM-FE-012 — Public event discovery page */
export default async function PublicEventsPage() {
  const { data: events } = await fetchPublicEvents();

  return (
    <section>
      <h1>Discover Events</h1>
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <p>No upcoming events at this time.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={String(event['id'])}>
              <h3>{String(event['title'])}</h3>
              <p>{String(event['description'])}</p>
              <a href={`/register-event/${String(event['slug'])}`}>Register</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
