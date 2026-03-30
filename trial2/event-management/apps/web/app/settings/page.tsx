import { APP_VERSION } from '@event-management/shared';

// TRACED:EM-UI-005 — Settings page uses APP_VERSION from shared

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-lg border border-[var(--border)] p-6">
        <h2 className="text-lg font-medium">Application Info</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Version: {APP_VERSION}
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border)] p-6">
        <h2 className="text-lg font-medium">Organization</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Configure your organization settings here.
        </p>
      </div>
    </div>
  );
}
