import { APP_VERSION } from '@fleet-dispatch/shared';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
        <h2 className="font-semibold mb-4">Application Info</h2>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-[var(--muted-foreground)]">Version:</dt>
            <dd>{APP_VERSION}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-[var(--muted-foreground)]">Application:</dt>
            <dd>Fleet Dispatch</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
