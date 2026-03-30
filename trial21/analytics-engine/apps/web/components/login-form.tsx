'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions';

/**
 * Login form component with accessible labels.
 * VERIFY: AE-A11Y-006 — form inputs have associated labels
 */
export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await loginAction(email, password);

    if (!result.success) {
      setError(result.error ?? 'Login failed');
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} aria-label="Login form">{/* TRACED: AE-A11Y-006 */}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          aria-required="true"
          minLength={8}
        />
      </div>
      {error && <p role="alert" aria-live="polite">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
