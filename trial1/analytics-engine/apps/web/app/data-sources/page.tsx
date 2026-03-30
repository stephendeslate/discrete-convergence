import { getDataSources } from '../../lib/actions';

export default async function DataSourcesPage() {
  const dataSources = await getDataSources();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Data Sources</h1>
        <a href="/data-sources/new" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '4px', textDecoration: 'none' }}>
          Add Data Source
        </a>
      </div>
      {dataSources.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No data sources configured. Add one to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Type</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((ds) => (
              <tr key={ds.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem' }}><a href={`/data-sources/${ds.id}`} style={{ color: 'var(--primary)' }}>{ds.name}</a></td>
                <td style={{ padding: '0.75rem' }}>{ds.type}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', background: ds.syncStatus === 'SYNCED' ? '#dcfce7' : 'var(--muted)', color: ds.syncStatus === 'SYNCED' ? '#166534' : 'var(--muted-foreground)' }}>
                    {ds.syncStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
