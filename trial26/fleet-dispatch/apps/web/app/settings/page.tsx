// TRACED:FD-WEB-023 — Settings page
import NavBar from '@/components/nav-bar';

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 border rounded-lg"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full px-3 py-2 border rounded-lg"
                placeholder="your@email.com"
                disabled
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
