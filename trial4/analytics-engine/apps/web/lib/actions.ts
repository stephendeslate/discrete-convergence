'use server';

// TRACED:AE-FE-002 — Server Actions check response.ok before redirect
import { redirect } from 'next/navigation';
import { validateEnvVars } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    redirect('/login?error=invalid_credentials');
    return;
  }

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role: 'USER' }),
  });

  if (!response.ok) {
    redirect('/register?error=registration_failed');
    return;
  }

  redirect('/login');
}

export async function fetchDashboards(token: string) {
  const response = await fetch(`${API_URL}/dashboards`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { error: 'Failed to fetch dashboards', data: [] };
  }

  return response.json();
}

export async function getEnvStatus() {
  try {
    validateEnvVars(['API_URL']);
    return { valid: true };
  } catch {
    return { valid: false };
  }
}
