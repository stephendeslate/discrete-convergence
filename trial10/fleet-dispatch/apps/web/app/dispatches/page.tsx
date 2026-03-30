import { getDispatches } from '../../lib/actions';

export default async function DispatchesPage() {
  const dispatches = await getDispatches();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dispatches</h1>
      </div>
      {dispatches.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No dispatches created yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {dispatches.map((d) => (
            <div key={d.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Dispatch {d.id.slice(0, 8)}</h2>
              <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'var(--muted)' }}>{d.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
