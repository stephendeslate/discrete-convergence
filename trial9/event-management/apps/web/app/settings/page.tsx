import { logoutAction } from '../../lib/actions';
import { APP_VERSION } from '@event-management/shared';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--muted-foreground)]">Application Version: {APP_VERSION}</p>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="rounded-md bg-[var(--destructive)] px-4 py-2 text-[var(--destructive-foreground)]">
          Sign Out
        </button>
      </form>
    </div>
  );
}
