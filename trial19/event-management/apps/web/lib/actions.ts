'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const API_ROUTES = {
  EVENTS: '/events',
  VENUES: '/venues',
  ATTENDEES: '/attendees',
  REGISTRATIONS: '/registrations',
  DASHBOARDS: '/dashboards',
  DATA_SOURCES: '/data-sources',
} as const;

// TRACED: EM-FI-001
export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  });

  if (!res.ok) {
    return { error: 'Invalid email or password' };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' });
  redirect('/dashboard');
}

export async function registerAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: 'VIEWER',
    }),
  });

  if (!res.ok) {
    return { error: 'Registration failed. Please try again.' };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' });
  redirect('/dashboard');
}

async function authenticatedFetch(path: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
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

export async function getDashboards() {
  return authenticatedFetch(API_ROUTES.DASHBOARDS);
}

export async function getDataSources() {
  return authenticatedFetch(API_ROUTES.DATA_SOURCES);
}

export async function getSettings() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      return { data: {} };
    }
    const data = await res.json();
    return { data };
  } catch {
    return { data: {} };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
