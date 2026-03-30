// TRACED:WEB-SETTINGS-PAGE
'use client';

import { useState, useEffect } from 'react';
import { fetchProfile } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetchProfile(token)
        .then(setProfile)
        .catch(() => setError('Failed to load profile. Please log in.'));
    } else {
      setError('Not logged in');
    }
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {profile && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-900">{profile.role}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Organization ID</label>
            <p className="text-gray-900 font-mono text-sm">{profile.organizationId}</p>
          </div>
        </div>
      )}
    </div>
  );
}
