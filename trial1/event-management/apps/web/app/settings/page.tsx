export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Settings</h1>
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>Organization</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Configure your organization name, branding, and subscription tier.</p>
      </div>
    </div>
  );
}
