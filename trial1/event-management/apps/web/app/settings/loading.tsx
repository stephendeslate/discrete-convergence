export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ height: '1.5rem', width: '100px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1.5rem' }} />
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
        <div style={{ height: '1rem', width: '150px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
        <div style={{ height: '2.5rem', width: '400px', background: 'var(--muted)', borderRadius: '4px' }} />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
