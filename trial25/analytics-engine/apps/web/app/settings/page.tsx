// TRACED:WEB-SETTINGS — Settings page for user preferences
'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('system');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium mb-1">Theme</label>
            <select id="theme" name="theme" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save Settings
          </button>
          {saved && <p className="text-green-600 dark:text-green-400 text-sm">Settings saved.</p>}
        </div>
      </div>
    </div>
  );
}
