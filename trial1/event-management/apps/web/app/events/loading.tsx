export default function EventsLoading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ height: '1.5rem', width: '80px', background: 'var(--muted)', borderRadius: '4px' }} />
        <div style={{ height: '2.5rem', width: '120px', background: 'var(--muted)', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ height: '1rem', width: '60%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '0.5rem' }} />
            <div style={{ height: '0.75rem', width: '80%', background: 'var(--muted)', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
