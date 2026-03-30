export default function DispatchesLoading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ height: '1.5rem', width: '120px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '3rem', background: 'var(--muted)', borderRadius: '4px' }} />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
