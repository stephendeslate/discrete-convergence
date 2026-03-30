export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div style={{ height: '1.5rem', width: '80px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
        <div style={{ height: '2.5rem', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
        <div style={{ height: '2.5rem', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
        <div style={{ height: '2.5rem', background: 'var(--muted)', borderRadius: '4px' }} />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
