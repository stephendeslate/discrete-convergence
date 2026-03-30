'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions';

// TRACED: AE-FE-005
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await loginAction(
      formData.get('email') as string,
      formData.get('password') as string,
    );
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <form action={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" required aria-required="true" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password" required aria-required="true" />
        {error && <p role="alert">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don&apos;t have an account? <a href="/register">Register</a>
      </p>
    </main>
  );
}
