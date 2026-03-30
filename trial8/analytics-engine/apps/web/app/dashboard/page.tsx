import { getDashboards } from '../../lib/actions';

export default async function DashboardPage() {
  const dashboards = await getDashboards();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboards</h1>
        <a href="/dashboard/new" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '4px', textDecoration: 'none' }}>
          New Dashboard
        </a>
      </div>
      {dashboards.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No dashboards yet. Create your first one.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {dashboards.map((d) => (
            <a key={d.id} href={`/dashboard/${d.id}`} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{d.title}</h2>
              {d.description && <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{d.description}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
