'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APP_VERSION } from '@event-management/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

// TRACED: EM-FI-001
const API_ROUTES = {
  EVENTS: '/events',
  VENUES: '/venues',
  TICKETS: '/tickets',
  SCHEDULES: '/schedules',
  ATTENDEES: '/attendees',
} as const;

// TRACED: EM-FI-002
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

// TRACED: EM-FI-003
export async function registerAction(formData: FormData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: 'USER',
      tenantId: formData.get('tenantId'),
    }),
  });

  if (!res.ok) {
    throw new Error('Registration failed');
  }

  redirect('/login');
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// TRACED: EM-FI-004
export async function getEvents() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.EVENTS}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  return res.json();
}

export async function getVenues() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.VENUES}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch venues');
  }
  return res.json();
}

export async function getTickets() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.TICKETS}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch tickets');
  }
  return res.json();
}

export async function getSchedules() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.SCHEDULES}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch schedules');
  }
  return res.json();
}

export async function getAttendees() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.ATTENDEES}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch attendees');
  }
  return res.json();
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function reportError(error: { message: string; stack?: string }) {
  try {
    await fetch(`${API_URL}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message, version: APP_VERSION }),
    });
  } catch {
    // Silently fail error reporting
  }
}
