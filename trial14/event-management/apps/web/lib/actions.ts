// TRACED: EM-FI-001
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_ROUTES = {
  EVENTS: '/events',
  VENUES: '/venues',
  ATTENDEES: '/attendees',
  REGISTRATIONS: '/registrations',
} as const;

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function loginAction(formData: FormData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  });
  if (!res.ok) {
    throw new Error('Login failed');
  }
  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
  });
  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      tenantId: formData.get('tenantId'),
      role: 'VIEWER',
    }),
  });
  if (!res.ok) {
    throw new Error('Registration failed');
  }
  redirect('/login');
}

async function authenticatedFetch(path: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.json();
}

export async function getEvents() {
  return authenticatedFetch(API_ROUTES.EVENTS);
}

export async function getVenues() {
  return authenticatedFetch(API_ROUTES.VENUES);
}

export async function getAttendees() {
  return authenticatedFetch(API_ROUTES.ATTENDEES);
}

export async function getRegistrations() {
  return authenticatedFetch(API_ROUTES.REGISTRATIONS);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
