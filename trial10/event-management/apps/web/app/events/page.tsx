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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Title</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Start Date</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>End Date</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => (
              <tr key={evt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}><a href={`/events/${evt.id}`} style={{ color: 'var(--primary)' }}>{evt.title}</a></td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', background: evt.status === 'PUBLISHED' ? '#dcfce7' : evt.status === 'CANCELLED' ? '#fecaca' : 'var(--muted)', color: evt.status === 'PUBLISHED' ? '#166534' : evt.status === 'CANCELLED' ? '#991b1b' : 'var(--muted-foreground)' }}>
                    {evt.status}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>{new Date(evt.startDate).toLocaleDateString()}</td>
                <td style={{ padding: '0.75rem' }}>{new Date(evt.endDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
