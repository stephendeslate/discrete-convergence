'use client';

import { useState } from 'react';
import { register } from '@/lib/actions';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DISPATCHER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await register(email, password, name, role);
    if (!result.success) {
      setError(result.error ?? 'Registration failed');
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Registration Successful</h1>
        <a href="/login" className="text-blue-600 hover:underline">Sign in to your account</a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="DISPATCHER">Dispatcher</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="CUSTOMER">Customer</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Register</button>
      </form>
    </div>
  );
}
