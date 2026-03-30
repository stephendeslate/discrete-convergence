export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ height: '1.5rem', width: '130px', background: 'var(--muted)', borderRadius: '4px' }} />
        <div style={{ height: '2.5rem', width: '150px', background: 'var(--muted)', borderRadius: '4px' }} />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: '3rem', width: '100%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '0.5rem' }} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
