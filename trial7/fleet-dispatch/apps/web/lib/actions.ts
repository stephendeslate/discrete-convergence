'use server';

import { redirect } from 'next/navigation';
import { APP_VERSION, sanitizeLogContext } from '@fleet-dispatch/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

// TRACED:FD-UI-002
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

  const data = (await response.json()) as { accessToken: string };
  // In a real app, store token in httpOnly cookie
  void data.accessToken;
  redirect('/dashboard');
}

// TRACED:FD-UI-003
export async function registerAction(formData: FormData): Promise<void> {
  const body = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    tenantId: formData.get('tenantId') as string,
    role: formData.get('role') as string,
  };

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  redirect('/login');
}

// TRACED:FD-UI-004
export async function getSession(): Promise<{ token: string } | null> {
  // Cookie-based session check placeholder
  return null;
}

export async function getVersion(): Promise<string> {
  return APP_VERSION;
}

// TRACED:FD-UI-005
export async function reportFrontendError(
  message: string,
  url: string,
): Promise<void> {
  const sanitized = sanitizeLogContext({ message, url });
  await fetch(`${API_URL}/errors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitized),
  });
}
