// TRACED:EM-FE-002
'use client';

import { useState } from 'react';
import { loginAction } from '../../lib/actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await loginAction(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Login</h1>
      {error && <div role="alert" className="rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900 dark:text-red-200">{error}</div>}
      {loading && <div role="status" aria-busy="true" className="text-blue-600"><span className="sr-only">Loading...</span>Signing in...</div>}
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          Login
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account? <a href="/register" className="text-blue-600 hover:underline dark:text-blue-400">Register</a>
      </p>
    </div>
  );
}
