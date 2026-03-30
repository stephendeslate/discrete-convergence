'use server';

import { cookies } from 'next/headers';

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3001';

/** TRACED:EM-FE-001 — Server action: login sets auth cookie */
export async function loginAction(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return { success: false, error: 'Invalid credentials' };
  }

  const data = await res.json() as { access_token: string; refresh_token: string };
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });
  cookieStore.set('refresh_token', data.refresh_token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 604800,
    path: '/',
  });

  return { success: true };
}

/** TRACED:EM-FE-002 — Server action: register */
export async function registerAction(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  organizationId: string,
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      organizationId,
      role: 'ATTENDEE',
    }),
  });

  if (!res.ok) {
    return { success: false, error: 'Registration failed' };
  }

  const data = await res.json() as { access_token: string; refresh_token: string };
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });

  return { success: true };
}

/** TRACED:EM-FE-003 — Helper to make authenticated API requests */
async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

/** TRACED:EM-FE-004 — Fetch events */
export async function fetchEvents(): Promise<{ data: Record<string, unknown>[]; total: number }> {
  const res = await authFetch('/events');
  if (!res.ok) {
    return { data: [], total: 0 };
  }
  return res.json() as Promise<{ data: Record<string, unknown>[]; total: number }>;
}

/** Fetch public events */
export async function fetchPublicEvents(): Promise<{ data: Record<string, unknown>[]; total: number }> {
  const res = await fetch(`${API_BASE}/public/events`);
  if (!res.ok) {
    return { data: [], total: 0 };
  }
  return res.json() as Promise<{ data: Record<string, unknown>[]; total: number }>;
}

/** Register for an event */
export async function registerForEvent(
  eventId: string,
  ticketTypeId: string,
): Promise<{ success: boolean; error?: string }> {
  const res = await authFetch(`/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify({ ticketTypeId }),
  });
  if (!res.ok) {
    return { success: false, error: 'Registration failed' };
  }
  return { success: true };
}

/** Cancel a registration */
export async function cancelRegistration(
  registrationId: string,
): Promise<{ success: boolean }> {
  const res = await authFetch(`/registrations/${registrationId}/cancel`, {
    method: 'POST',
  });
  return { success: res.ok };
}

/** Fetch my registrations */
export async function fetchMyRegistrations(): Promise<{ data: Record<string, unknown>[]; total: number }> {
  const res = await authFetch('/my-registrations');
  if (!res.ok) {
    return { data: [], total: 0 };
  }
  return res.json() as Promise<{ data: Record<string, unknown>[]; total: number }>;
}

/** Broadcast notification */
export async function broadcastNotification(
  subject: string,
  body: string,
  userIds: string[],
): Promise<{ success: boolean }> {
  const res = await authFetch('/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify({ subject, body, userIds }),
  });
  return { success: res.ok };
}

/** Logout */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('refresh_token');
}
