// TRACED:FD-FRN-002 — Server Actions checking response.ok before redirect
'use server';

import { redirect } from 'next/navigation';
import { APP_VERSION } from '@fleet-dispatch/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

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

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const data = await response.json();
    return { error: data.message ?? 'Registration failed' };
  }

  redirect('/dashboard');
}

export async function getVersion(): Promise<string> {
  return APP_VERSION;
}
