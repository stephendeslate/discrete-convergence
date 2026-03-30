export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" style={{ padding: '2rem' }}>
      <div style={{ height: '2rem', width: '120px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1.5rem' }} />
      <div style={{ height: '150px', width: '100%', background: 'var(--muted)', borderRadius: '8px', marginBottom: '1rem' }} />
      <div style={{ height: '100px', width: '100%', background: 'var(--muted)', borderRadius: '8px' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
