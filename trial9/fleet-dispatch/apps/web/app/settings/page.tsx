export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold mb-2">Account</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Manage your account settings and preferences.</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold mb-2">Notifications</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Configure dispatch and maintenance notifications.</p>
        </div>
      </div>
    </div>
  );
}
