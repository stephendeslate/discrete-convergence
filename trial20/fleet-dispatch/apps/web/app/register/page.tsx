'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { registerAction } from '@/lib/actions';

// TRACED: FD-AUTH-002
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await registerAction(email, password, role, tenantId);
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : 'Registration failed');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="mb-6 text-center text-2xl font-bold">Create Account</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <p>{error}</p>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-email" className="mb-1 block text-sm font-medium">Email</label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="mb-1 block text-sm font-medium">Password</label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="reg-role" className="mb-1 block text-sm font-medium">Role</label>
            <Select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="VIEWER">Viewer</option>
              <option value="DISPATCHER">Dispatcher</option>
            </Select>
          </div>
          <div>
            <label htmlFor="reg-tenant" className="mb-1 block text-sm font-medium">Tenant ID</label>
            <Input
              id="reg-tenant"
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Already have an account? <a href="/login" className="text-primary-600 hover:underline">Sign In</a>
        </p>
      </Card>
    </div>
  );
}
