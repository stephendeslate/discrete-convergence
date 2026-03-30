export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div style={{ height: '1.5rem', width: '100px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ height: '2.5rem', width: '100%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ height: '2.5rem', width: '100%', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ height: '2.5rem', width: '100%', background: 'var(--muted)', borderRadius: '4px' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
