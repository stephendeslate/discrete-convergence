export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true">
      <div style={{ height: '1.5rem', width: '100px', background: 'var(--muted)', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ height: '10rem', background: 'var(--muted)', borderRadius: '4px' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
