// TRACED:EM-FE-005
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold dark:text-white">Account Settings</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account preferences and organization settings.</p>
      </div>
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold dark:text-white">Notifications</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Configure notification preferences for events and updates.</p>
      </div>
    </div>
  );
}
