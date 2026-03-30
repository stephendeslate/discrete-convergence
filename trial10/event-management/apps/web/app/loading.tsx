// TRACED:EM-FE-002 — Loading state with role=status and aria-busy=true
export default function Loading() {
  return (
    <div role="status" aria-busy="true" style={{ padding: '2rem' }}>
      <div style={{ height: '2rem', width: '200px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ height: '1rem', width: '400px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '0.5rem' }} />
      <div style={{ height: '1rem', width: '300px', background: 'var(--muted)', borderRadius: '4px' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
