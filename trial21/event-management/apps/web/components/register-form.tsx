'use client';

import { useState } from 'react';
import { registerAction } from '@/lib/actions';

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const organizationId = formData.get('organizationId') as string;
    const result = await registerAction(email, password, firstName, lastName, organizationId);
    if (!result.success) {
      setError(result.error ?? 'Registration failed');
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <p role="alert">{error}</p>}

      <label htmlFor="firstName">First Name</label>
      <input id="firstName" type="text" name="firstName" required aria-required="true" />

      <label htmlFor="lastName">Last Name</label>
      <input id="lastName" type="text" name="lastName" required aria-required="true" />

      <label htmlFor="regEmail">Email</label>
      <input id="regEmail" type="email" name="email" required aria-required="true" />

      <label htmlFor="regPassword">Password</label>
      <input id="regPassword" type="password" name="password" required aria-required="true" />

      <input type="hidden" name="organizationId" value="default-org" />

      <button type="submit">Create Account</button>
    </form>
  );
}
