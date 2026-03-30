export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <section className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <p className="text-gray-500">Manage your account settings and preferences.</p>
        </section>
        <section className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Tenant</h2>
          <p className="text-gray-500">View your organization details.</p>
        </section>
      </div>
    </div>
  );
}
