import { getVehicles, getDrivers, getDispatches } from '../../lib/actions';

export default async function DashboardPage() {
  const [vehicles, drivers, dispatches] = await Promise.all([
    getVehicles(),
    getDrivers(),
    getDispatches(),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Vehicles</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{vehicles.length}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Drivers</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{drivers.length}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Active Dispatches</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{dispatches.length}</p>
        </div>
      </div>
    </div>
  );
}
