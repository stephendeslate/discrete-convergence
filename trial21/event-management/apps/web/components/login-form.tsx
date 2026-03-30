'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions';

/** TRACED:EM-FE-016 — Login form component */
export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const result = await loginAction(email, password);
    if (!result.success) {
      setError(result.error ?? 'Login failed');
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <p role="alert">{error}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" type="email" name="email" required aria-required="true" />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" name="password" required aria-required="true" />

      <button type="submit">Sign In</button>
    </form>
  );
}
