// TRACED:EM-FE-003 — Server Actions with 'use server' and response.ok check
'use server';

import { redirect } from 'next/navigation';
import { APP_VERSION } from '@event-management/shared';

const API_URL = process.env['API_URL'];

export async function loginAction(formData: FormData) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-App-Version': APP_VERSION },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  redirect('/events');
}

export async function registerAction(formData: FormData) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-App-Version': APP_VERSION },
    body: JSON.stringify({
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
      role: formData.get('role'),
    }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  redirect('/events');
}
