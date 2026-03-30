export default function VenuesLoading() {
  return (
    <div role="status" aria-busy="true" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ height: '2rem', width: '100px', background: 'var(--muted)', borderRadius: '4px' }} />
        <div style={{ height: '2.5rem', width: '120px', background: 'var(--muted)', borderRadius: '4px' }} />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ height: '3rem', width: '100%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '0.5rem' }} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
