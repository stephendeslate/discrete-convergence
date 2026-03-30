export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true" style={{ padding: '2rem' }}>
      <div style={{ height: '2rem', width: '180px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1.5rem' }} />
      <div style={{ height: '3rem', width: '100%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '0.5rem' }} />
      <div style={{ height: '3rem', width: '100%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '0.5rem' }} />
      <div style={{ height: '3rem', width: '100%', background: 'var(--muted)', borderRadius: '4px' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
