// TRACED:EM-FE-001 — register page with server action
'use client';

import { useActionState } from 'react';
import { registerAction } from '../../lib/actions';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Register</h1>
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
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" required />
        </div>
        <input type="hidden" name="role" value="ATTENDEE" />
        <input type="hidden" name="organizationId" value="" />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </div>
  );
}
