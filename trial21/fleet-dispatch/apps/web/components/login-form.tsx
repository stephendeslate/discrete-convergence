'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions';

/**
 * Login form component with email/password validation.
 * TRACED: FD-FE-008
 */
export function LoginForm() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    const result = await loginAction(email, password);

    if (!result.success) {
      setError(result.error ?? 'Login failed');
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
