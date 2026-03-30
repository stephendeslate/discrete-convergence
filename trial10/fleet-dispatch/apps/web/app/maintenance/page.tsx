import { getMaintenanceRecords } from '../../lib/actions';

export default async function MaintenancePage() {
  const records = await getMaintenanceRecords();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Maintenance Records</h1>
      </div>
      {records.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No maintenance records yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {records.map((r) => (
            <div key={r.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{r.type}</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
