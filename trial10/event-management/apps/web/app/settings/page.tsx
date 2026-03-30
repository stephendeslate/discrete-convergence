export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Settings</h1>
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>Tenant Configuration</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="tenantName" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Tenant Name</label>
          <input id="tenantName" type="text" defaultValue="Default Tenant" readOnly
            style={{ width: '100%', maxWidth: '400px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--muted)', color: 'var(--foreground)' }} />
        </div>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>Event Settings</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Configure default event settings, ticket pricing rules, and registration policies for your organization.
        </p>
      </div>
    </div>
  );
}
