'use client';

import { useState } from 'react';
import { login } from '@/lib/actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error ?? 'Login failed');
    } else {
      window.location.href = '/work-orders';
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <button type="submit" className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Sign In</button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        No account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
      </p>
    </div>
  );
}
