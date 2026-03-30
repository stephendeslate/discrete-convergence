export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" style={{ padding: '2rem' }}>
      <div style={{ height: '2rem', width: '200px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '120px', background: 'var(--muted)', borderRadius: '8px' }} />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
