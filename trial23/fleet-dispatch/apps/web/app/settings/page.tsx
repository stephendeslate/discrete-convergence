'use client';

import { logout } from '@/lib/actions';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
        <form action={logout}>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
