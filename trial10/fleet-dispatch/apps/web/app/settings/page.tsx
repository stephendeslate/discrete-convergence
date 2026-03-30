import { APP_VERSION } from '@fleet-dispatch/shared';

export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Settings</h1>
      <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Application</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Version: {APP_VERSION}</p>
      </div>
    </div>
  );
}
