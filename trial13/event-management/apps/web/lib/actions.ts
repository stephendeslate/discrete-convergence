'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-FI-001
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
  cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' });
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

async function authFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getEvents(page = 1, limit = 20) {
  return authFetch(`${API_ROUTES.EVENTS}?page=${page}&limit=${limit}`);
}

export async function getEvent(id: string) {
  return authFetch(`${API_ROUTES.EVENTS}/${id}`);
}

export async function getVenues(page = 1, limit = 20) {
  return authFetch(`${API_ROUTES.VENUES}?page=${page}&limit=${limit}`);
}

export async function getVenue(id: string) {
  return authFetch(`${API_ROUTES.VENUES}/${id}`);
}

export async function getAttendees(page = 1, limit = 20) {
  return authFetch(`${API_ROUTES.ATTENDEES}?page=${page}&limit=${limit}`);
}

export async function getAttendee(id: string) {
  return authFetch(`${API_ROUTES.ATTENDEES}/${id}`);
}

export async function getRegistrations(page = 1, limit = 20) {
  return authFetch(`${API_ROUTES.REGISTRATIONS}?page=${page}&limit=${limit}`);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function getAppVersion() {
  return APP_VERSION;
}
