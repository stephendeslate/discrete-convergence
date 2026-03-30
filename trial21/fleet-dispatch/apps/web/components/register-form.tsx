'use client';

import { useState } from 'react';
import { registerAction } from '@/lib/actions';

/**
 * Registration form for new companies.
 * TRACED: FD-FE-009
 */
export function RegisterForm() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await registerAction({
      email: form.get('email') as string,
      password: form.get('password') as string,
      firstName: form.get('firstName') as string,
      lastName: form.get('lastName') as string,
      companyName: form.get('companyName') as string,
      role: 'ADMIN',
    });

    if (!result.success) {
      setError(result.error ?? 'Registration failed');
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Registration form">
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" name="email" type="email" required />
      </div>
      <div>
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
        />
      </div>
      <div>
        <label htmlFor="reg-first">First Name</label>
        <input id="reg-first" name="firstName" type="text" required />
      </div>
      <div>
        <label htmlFor="reg-last">Last Name</label>
        <input id="reg-last" name="lastName" type="text" required />
      </div>
      <div>
        <label htmlFor="reg-company">Company Name</label>
        <input id="reg-company" name="companyName" type="text" required />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
