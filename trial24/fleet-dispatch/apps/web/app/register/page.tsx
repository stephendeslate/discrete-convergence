// TRACED:WEB-REGISTER-PAGE
'use client';

import { useState } from 'react';
import { registerAction } from '@/lib/actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const companyId = formData.get('companyId') as string;

    const result = await registerAction(email, password, companyId);
    if (result.success) {
      window.location.href = '/vehicles';
    } else {
      setError(result.error ?? 'Registration failed');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border"
          />
        </div>
        <div>
          <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
            Company ID
          </label>
          <input
            id="companyId"
            name="companyId"
            type="text"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}
