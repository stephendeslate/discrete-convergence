// TRACED:EM-FE-005 — Server actions with 'use server' directive
'use server';

import { redirect } from 'next/navigation';

async function fetchListData(endpoint: string) {
  const response = await fetch(`${process.env['API_URL']}/${endpoint}`, { cache: 'no-store' });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.data ?? [];
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${process.env['API_URL']}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

  redirect('/events');
}

export async function getEvents() {
  return fetchListData('events');
}

export async function getVenues() {
  return fetchListData('venues');
}
