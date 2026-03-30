// TRACED:EM-FE-002 — Server actions with getToken/getSession helper
'use server';

import { cookies } from 'next/headers';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export async function getSession(): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
} | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    return JSON.parse(session) as {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
    };
  } catch {
    return null;
  }
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    return { success: false, error: body.message ?? 'Login failed' };
  }
  const data = await res.json() as { accessToken: string; user: { id: string; email: string; name: string; role: string; tenantId: string } };
  const cookieStore = await cookies();
  cookieStore.set('token', data.accessToken, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 900 });
  cookieStore.set('session', JSON.stringify(data.user), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 900 });
  return { success: true };
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  tenantId: string;
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    return { success: false, error: body.message ?? 'Registration failed' };
  }
  const result = await res.json() as { accessToken: string; user: { id: string; email: string; name: string; role: string; tenantId: string } };
  const cookieStore = await cookies();
  cookieStore.set('token', result.accessToken, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 900 });
  cookieStore.set('session', JSON.stringify(result.user), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 900 });
  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('session');
}

export async function fetchEvents(page = 1, pageSize = 20): Promise<{
  data: Array<{ id: string; title: string; description: string | null; status: string; startDate: string; endDate: string; venue?: { name: string } }>;
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}> {
  const res = await apiFetch(`/events?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json() as Promise<{
    data: Array<{ id: string; title: string; description: string | null; status: string; startDate: string; endDate: string; venue?: { name: string } }>;
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>;
}

export async function fetchEvent(id: string): Promise<{
  id: string; title: string; description: string | null; status: string;
  startDate: string; endDate: string;
  venue?: { name: string; address: string };
  tickets: Array<{ id: string; type: string; price: string; quantity: number; sold: number }>;
  attendees: Array<{ id: string; name: string; email: string; checkInStatus: string }>;
}> {
  const res = await apiFetch(`/events/${id}`);
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json() as Promise<{
    id: string; title: string; description: string | null; status: string;
    startDate: string; endDate: string;
    venue?: { name: string; address: string };
    tickets: Array<{ id: string; type: string; price: string; quantity: number; sold: number }>;
    attendees: Array<{ id: string; name: string; email: string; checkInStatus: string }>;
  }>;
}

export async function createEvent(data: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  venueId?: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const res = await apiFetch('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    return { success: false, error: body.message ?? 'Failed to create event' };
  }
  const result = await res.json() as { id: string };
  return { success: true, id: result.id };
}

export async function fetchVenues(page = 1, pageSize = 20): Promise<{
  data: Array<{ id: string; name: string; address: string; capacity: number }>;
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}> {
  const res = await apiFetch(`/venues?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json() as Promise<{
    data: Array<{ id: string; name: string; address: string; capacity: number }>;
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>;
}

export async function fetchAttendees(eventId: string, page = 1, pageSize = 20): Promise<{
  data: Array<{ id: string; name: string; email: string; checkInStatus: string }>;
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}> {
  const res = await apiFetch(`/attendees?eventId=${eventId}&page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error('Failed to fetch attendees');
  return res.json() as Promise<{
    data: Array<{ id: string; name: string; email: string; checkInStatus: string }>;
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>;
}
