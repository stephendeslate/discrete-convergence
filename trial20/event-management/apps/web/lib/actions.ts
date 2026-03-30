'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// TRACED: EM-FE-002 — Server action for login with cookie-based token storage
export async function loginAction(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message || 'Login failed', success: false };
  }

  const data = await res.json();
  const cookieStore = await cookies();

  cookieStore.set('token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });

  return { success: true, error: null };
}

// TRACED: EM-FE-003 — Server action for registration
export async function registerAction(
  email: string,
  password: string,
  role: string,
  tenantId: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, tenantId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message || 'Registration failed', success: false };
  }

  return { success: true, error: null };
}

// TRACED: EM-FE-004 — Authenticated fetch helper using httpOnly cookie
export async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { error: 'Not authenticated', data: null };
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message || 'Request failed', data: null };
  }

  const data = await res.json();
  return { data, error: null };
}

export async function fetchEvents(page = 1, limit = 20) {
  return authenticatedFetch(`/events?page=${page}&limit=${limit}`);
}

export async function fetchVenues(page = 1, limit = 20) {
  return authenticatedFetch(`/venues?page=${page}&limit=${limit}`);
}

export async function fetchAttendees(page = 1, limit = 20) {
  return authenticatedFetch(`/attendees?page=${page}&limit=${limit}`);
}

export async function fetchRegistrations(page = 1, limit = 20) {
  return authenticatedFetch(`/registrations?page=${page}&limit=${limit}`);
}

export async function fetchDashboards() {
  return authenticatedFetch('/dashboards');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}
