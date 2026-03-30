import { APP_VERSION } from '@fleet-dispatch/shared';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Application</h2>
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="font-medium">Version:</dt>
              <dd>{APP_VERSION}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Environment:</dt>
              <dd>Production</dd>
            </div>
          </dl>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <p className="text-gray-500">Account settings will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
}
