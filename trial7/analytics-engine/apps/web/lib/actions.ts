'use server';

import { redirect } from 'next/navigation';
import { APP_VERSION, validateEnvVars } from '@analytics-engine/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

// TRACED:AE-UI-002
export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<void> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      tenantId: formData.get('tenantId'),
      role: 'USER',
    }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  redirect('/login');
}

export async function getVersion(): Promise<string> {
  return APP_VERSION;
}

export async function checkEnv(): Promise<void> {
  validateEnvVars(['API_URL']);
}
