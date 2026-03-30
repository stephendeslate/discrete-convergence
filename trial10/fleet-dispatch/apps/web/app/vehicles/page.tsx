import { getVehicles } from '../../lib/actions';

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Vehicles</h1>
      </div>
      {vehicles.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No vehicles registered yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {vehicles.map((v) => (
            <div key={v.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{v.licensePlate}</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{v.make} {v.model}</p>
              <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'var(--muted)' }}>{v.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
