'use client';

import { useActionState } from 'react';
import { registerAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, { error: null });

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Register</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" required autoComplete="name" />
        </div>
        {state?.error && (
          <p role="alert" className="text-sm text-[var(--destructive)]">{state.error}</p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </div>
  );
}
