export default function RegistrationsLoading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ height: '1.5rem', width: '140px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1.5rem' }} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: '3rem', width: '100%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '0.5rem' }} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
