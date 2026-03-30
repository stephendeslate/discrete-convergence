import { getDrivers } from '../../lib/actions';

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Drivers</h1>
      </div>
      {drivers.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No drivers registered yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {drivers.map((d) => (
            <div key={d.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{d.firstName} {d.lastName}</h2>
              <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'var(--muted)' }}>{d.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
