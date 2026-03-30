// TRACED:WEB-REGISTER — Register page with form and tenant ID
'use client';

import { useState, type FormEvent } from 'react';
import { registerAction } from '../../lib/actions';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set('email', email);
      formData.set('password', password);
      if (tenantId.trim()) {
        formData.set('tenantId', tenantId.trim());
      }
      const result = await registerAction(formData);

      if (!result.success) {
        setError(result.error ?? 'Registration failed');
        return;
      }

      const data = result.data as { accessToken: string; refreshToken: string } | undefined;
      if (data && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        // auth-token-stored: store token in cookie for SSR access
        document.cookie = `auth-token=${data.accessToken}; path=/; max-age=900; SameSite=Lax`;
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=900; SameSite=Lax`;
        document.cookie = `refresh-token=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div>
          <label htmlFor="tenantId" className="block text-sm font-medium mb-1">Tenant ID (optional)</label>
          <input id="tenantId" name="tenantId" type="text" value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
      </p>
    </div>
  );
}
