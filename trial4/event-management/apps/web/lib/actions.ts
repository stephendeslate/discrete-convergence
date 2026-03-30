// TRACED:EM-UI-002 — Server Actions with 'use server' checking response.ok
'use server';

import { redirect } from 'next/navigation';
import { APP_VERSION } from '@event-management/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

  const data = await response.json();
  redirect(`/dashboard?token=${data.accessToken}`);
}

export async function registerAction(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const role = formData.get('role') as string;
  const organizationId = formData.get('organizationId') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName, role, organizationId }),
  });

  if (!response.ok) {
    return { error: 'Registration failed' };
  }

  redirect('/login');
}

export async function getAppVersion() {
  return APP_VERSION;
}
