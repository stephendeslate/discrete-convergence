// TRACED:EM-FE-001 — login page with server action
'use client';

import { useActionState } from 'react';
import { loginAction } from '../../lib/actions';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Login</h1>
      {state?.error && (
        <div role="alert" className="mt-2 rounded bg-red-100 p-2 text-red-800 dark:bg-red-900 dark:text-red-200">
          {state.error}
        </div>
      )}
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
}
