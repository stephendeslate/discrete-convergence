// TRACED:WEB-SETTINGS-PAGE
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
        <p className="text-gray-600">
          Manage your account settings and preferences.
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-700">Theme</span>
            <span className="text-gray-500">System</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-700">Language</span>
            <span className="text-gray-500">English</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-700">Notifications</span>
            <span className="text-gray-500">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
