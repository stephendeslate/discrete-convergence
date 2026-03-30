import { getEvents } from '../../lib/actions';

export default async function DashboardPage() {
  const events = await getEvents();

  const published = events.filter((e) => e.status === 'PUBLISHED').length;
  const draft = events.filter((e) => e.status === 'DRAFT').length;
  const cancelled = events.filter((e) => e.status === 'CANCELLED').length;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Total Events</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{events.length}</p>
        </div>
        <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Published</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{published}</p>
        </div>
        <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Draft</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{draft}</p>
        </div>
        <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Cancelled</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{cancelled}</p>
        </div>
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Events</h2>
      {events.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No events yet. Create your first event.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {events.slice(0, 6).map((evt) => (
            <a key={evt.id} href={`/events/${evt.id}`} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{evt.title}</h3>
              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', background: evt.status === 'PUBLISHED' ? '#dcfce7' : 'var(--muted)', color: evt.status === 'PUBLISHED' ? '#166534' : 'var(--muted-foreground)' }}>
                {evt.status}
              </span>
              {evt.description && <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{evt.description}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
