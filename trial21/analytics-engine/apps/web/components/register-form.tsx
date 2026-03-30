'use client';

import { useState } from 'react';
import { registerAction } from '@/lib/actions';

/**
 * Registration form component with accessible labels.
 * VERIFY: AE-A11Y-007 — registration form with proper label associations
 */
export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const tenantName = formData.get('tenantName') as string;
    const role = formData.get('role') as string;

    const result = await registerAction(email, password, name, tenantName, role);

    if (!result.success) {
      setError(result.error ?? 'Registration failed');
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} aria-label="Registration form">{/* TRACED: AE-A11Y-007 */}
      <div>
        <label htmlFor="reg-name">Name</label>
        <input id="reg-name" name="name" type="text" required aria-required="true" />
      </div>
      <div>
        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" name="email" type="email" required aria-required="true" />
      </div>
      <div>
        <label htmlFor="reg-password">Password</label>
        <input id="reg-password" name="password" type="password" required aria-required="true" minLength={8} />
      </div>
      <div>
        <label htmlFor="reg-tenant">Organization Name</label>
        <input id="reg-tenant" name="tenantName" type="text" required aria-required="true" />
      </div>
      <div>
        <label htmlFor="reg-role">Role</label>
        <select id="reg-role" name="role" required aria-required="true">
          <option value="USER">User</option>
          <option value="VIEWER">Viewer</option>
        </select>
      </div>
      {error && <p role="alert" aria-live="polite">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
