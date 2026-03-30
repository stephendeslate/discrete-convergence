import { getSettings } from '@/lib/actions';

export default async function SettingsPage() {
  const result = await getSettings();
  const settings = result?.data ?? {};

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-[var(--muted-foreground)]">Email</dt>
            <dd className="text-base">{settings.email ?? 'Not available'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--muted-foreground)]">Role</dt>
            <dd className="text-base">{settings.role ?? 'Not available'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
