export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" style={{ padding: '2rem' }}>
      <div style={{ height: '2rem', width: '150px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: '100px', background: 'var(--muted)', borderRadius: '8px' }} />
        ))}
      </div>
      <div style={{ height: '1.5rem', width: '180px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: '120px', background: 'var(--muted)', borderRadius: '8px' }} />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
