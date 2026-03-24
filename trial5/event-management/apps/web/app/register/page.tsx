'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/actions';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'VIEWER',
    tenantId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await register(form);
    if (result.success) {
      router.push('/events');
    } else {
      setError(result.error ?? 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-2xl font-bold">Register</h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <Input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <Input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <Input id="password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium">Role</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="VIEWER">Viewer</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
          </div>
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium">Tenant ID</label>
            <Input id="tenantId" value={form.tenantId} onChange={(e) => updateField('tenantId', e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
        </p>
      </Card>
    </div>
  );
}
