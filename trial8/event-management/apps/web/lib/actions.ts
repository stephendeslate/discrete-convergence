'use server';

import { cookies } from 'next/headers';

const API_BASE = process.env.API_URL ?? 'http://localhost:3001';

// TRACED: EM-AUTH-003 — Server action: login with cookie-based token storage
export async function loginAction(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message ?? 'Login failed', success: false };
  }

  const data = await res.json();

  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return { success: true, user: data.user };
}

// TRACED: EM-AUTH-004 — Server action: register new user
export async function registerAction(
  email: string,
  password: string,
  name: string,
  role: string,
  tenantId: string,
) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, tenantId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message ?? 'Registration failed', success: false };
  }

  const data = await res.json();
  return { success: true, user: data };
}

// TRACED: EM-AUTH-005 — Protected fetch helper with Bearer token from cookie
export async function protectedFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { error: 'Not authenticated', status: 401 };
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message ?? 'Request failed', status: res.status };
  }

  return res.json();
}

// TRACED: EM-API-011 — Fetch events list
export async function getEvents(page = 1, pageSize = 20) {
  return protectedFetch(`/events?page=${page}&pageSize=${pageSize}`);
}

// TRACED: EM-API-012 — Fetch single event by ID
export async function getEvent(id: string) {
  return protectedFetch(`/events/${id}`);
}

// TRACED: EM-AUTH-006 — Logout by clearing token cookie
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}
