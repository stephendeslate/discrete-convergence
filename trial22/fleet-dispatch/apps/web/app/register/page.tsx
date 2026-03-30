'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'USER', tenantId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { register } = await import('@/lib/actions');
      await register(form.email, form.password, form.name, form.role, form.tenantId);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-4">Registration Successful</h1>
        <p>Your account has been created. <a href="/login" className="text-blue-600 underline">Login here</a>.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      {error && <p className="text-red-600 mb-4" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2" required aria-required="true" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded px-3 py-2" required aria-required="true" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded px-3 py-2" required aria-required="true" minLength={8} />
        </div>
        <div>
          <label htmlFor="tenantId" className="block text-sm font-medium mb-1">Tenant ID</label>
          <input id="tenantId" type="text" value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
            className="w-full border rounded px-3 py-2" required aria-required="true" />
        </div>
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Account
        </button>
      </form>
    </div>
  );
}
