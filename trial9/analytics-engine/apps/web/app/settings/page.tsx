import { APP_VERSION } from '@analytics-engine/shared';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Settings</h1>
      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--card)]">
          <h3 className="font-semibold text-[var(--card-foreground)]">Application</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Version: {APP_VERSION}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--card)]">
          <h3 className="font-semibold text-[var(--card-foreground)]">Profile</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Manage your account settings</p>
        </div>
      </div>
    </div>
  );
}
