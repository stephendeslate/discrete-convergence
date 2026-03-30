// TRACED:AE-UI-002 — Server Actions with response.ok check
'use server';

import { redirect } from 'next/navigation';
import { validateEnvVars } from '@analytics-engine/shared';

function getApiUrl(): string {
  validateEnvVars(['API_URL']);
  return process.env.API_URL as string;
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const tenantName = formData.get('tenantName') as string;

  const response = await fetch(`${getApiUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenantName, role: 'USER' }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  redirect('/dashboard');
}

export async function createDashboardAction(
  title: string,
  description: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${getApiUrl()}/dashboards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to create dashboard');
  }

  redirect('/dashboard');
}

export async function reportClientError(error: {
  message: string;
  stack?: string;
  url: string;
}): Promise<void> {
  try {
    await fetch(`${getApiUrl()}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });
  } catch {
    // Silently fail — error reporting should not crash the app
  }
}
