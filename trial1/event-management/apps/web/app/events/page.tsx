import { getEvents } from '../../lib/actions';

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Events</h1>
        <a href="/events/new" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '4px', textDecoration: 'none' }}>
          New Event
        </a>
      </div>
      {events.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No events yet. Create your first one.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {events.map((e: { id: string; name: string; status: string; description?: string }) => (
            <a key={e.id} href={`/events/${e.id}`} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h2 style={{ fontWeight: 600 }}>{e.name}</h2>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--muted)', borderRadius: '9999px' }}>{e.status}</span>
              </div>
              {e.description && <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{e.description}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
