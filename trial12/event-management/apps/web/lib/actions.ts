'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APP_VERSION } from '@event-management/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

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
      role: formData.get('role') ?? 'USER',
      tenantId: formData.get('tenantId'),
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
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return res.json();
}

// TRACED: EM-FI-004
export async function getEvents() {
  return authenticatedFetch(API_ROUTES.EVENTS);
}

export async function getVenues() {
  return authenticatedFetch(API_ROUTES.VENUES);
}

export async function getTickets() {
  return authenticatedFetch(API_ROUTES.TICKETS);
}

export async function getSchedules() {
  return authenticatedFetch(API_ROUTES.SCHEDULES);
}

export async function getAttendees() {
  return authenticatedFetch(API_ROUTES.ATTENDEES);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function getAppVersion() {
  return APP_VERSION;
}
