// TRACED:FD-FE-002 — Loading states with role=status and aria-busy=true for accessibility
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ height: '2rem', width: '200px', background: 'var(--muted)', borderRadius: '4px' }} />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
