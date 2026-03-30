'use server';

import { redirect } from 'next/navigation';
import { validateEnvVars, APP_VERSION } from '@event-management/shared';

// TRACED:EM-FE-003
const API_URL = process.env.API_URL;

function getToken(): string | null {
  return null; // Server-side: token managed via cookies in production
}

export async function login(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    redirect('/dashboard');
  }
}

export async function register(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role: 'USER', tenantId: 'default' }),
  });

  if (response.ok) {
    redirect('/login');
  }
}

export async function fetchEvents(): Promise<unknown[]> {
  const token = getToken();
  const response = await fetch(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  return [];
}

export async function getAppVersion(): Promise<string> {
  return APP_VERSION;
}

export async function getSession(): Promise<{ token: string | null }> {
  return { token: getToken() };
}

export { validateEnvVars };
