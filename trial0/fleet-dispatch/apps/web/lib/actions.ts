// TRACED:FD-FE-003
'use server';

import { redirect } from 'next/navigation';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

export async function loginAction(formData: FormData) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  redirect('/dispatch');
}

export async function registerAction(formData: FormData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  redirect('/login');
}
