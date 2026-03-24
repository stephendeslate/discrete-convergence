// TRACED:AE-FE-003 — Server Actions with 'use server' and response.ok check
'use server';

import { redirect } from 'next/navigation';
import { APP_VERSION } from '@analytics-engine/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    return { error: data.message ?? 'Login failed' };
  }

  redirect('/dashboards');
}

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role: 'USER', tenantId: 'default' }),
  });

  if (!response.ok) {
    const data = await response.json();
    return { error: data.message ?? 'Registration failed' };
  }

  redirect('/dashboards');
}

export async function reportError(error: { message: string; stack?: string; url?: string }): Promise<void> {
  await fetch(`${API_URL}/errors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(error),
  });
}
