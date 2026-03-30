// TRACED:EM-UI-002
'use server';

import { redirect } from 'next/navigation';
import { APP_VERSION } from '@event-management/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const organizationId = formData.get('organizationId') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, organizationId }),
  });

  if (response.ok) {
    redirect('/dashboard');
  }
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const organizationId = formData.get('organizationId') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, organizationId }),
  });

  if (response.ok) {
    redirect('/login');
  }
}

export async function getAppVersion(): Promise<string> {
  return APP_VERSION;
}
