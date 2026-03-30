import { getVenues } from '../../lib/actions';

export default async function VenuesPage() {
  const venues = await getVenues();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Venues</h1>
        <a href="/venues/new" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '4px', textDecoration: 'none' }}>
          Add Venue
        </a>
      </div>
      {venues.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No venues configured.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Capacity</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v: { id: string; name: string; capacity: number; type: string }) => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}><a href={`/venues/${v.id}`} style={{ color: 'var(--primary)' }}>{v.name}</a></td>
                <td style={{ padding: '0.75rem' }}>{v.capacity}</td>
                <td style={{ padding: '0.75rem' }}>{v.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
