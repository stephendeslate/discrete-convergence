'use client';

import { useState } from 'react';
import { registerAction } from '@/lib/actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await registerAction(
      formData.get('email') as string,
      formData.get('password') as string,
      formData.get('name') as string,
    );
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <main>
        <h1>Registration Successful</h1>
        <p>Your account has been created. <a href="/login">Login now</a></p>
      </main>
    );
  }

  return (
    <main>
      <h1>Register</h1>
      <form action={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" name="name" required aria-required="true" />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" required aria-required="true" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password" required aria-required="true" minLength={8} />
        {error && <p role="alert">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </main>
  );
}
