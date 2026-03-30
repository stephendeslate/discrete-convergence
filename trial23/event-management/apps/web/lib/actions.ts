// TRACED: EM-FE-001 — Token in httpOnly cookie
// TRACED: EM-FE-002 — Server actions with Authorization bearer header
'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? 'Login failed');
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  if (data.refresh_token) {
    cookieStore.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? 'Registration failed');
  }

  return res.json();
}

export async function fetchEvents(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchVenues(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/venues?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
}

export async function fetchRegistrations(eventId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/events/${eventId}/registrations`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch registrations');
  return res.json();
}

export async function fetchDashboards(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dashboards?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch dashboards');
  return res.json();
}

export async function fetchDataSources(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_URL}/data-sources?page=${page}&limit=${limit}`,
    {
      headers: { ...headers, 'Content-Type': 'application/json' },
    },
  );

  if (!res.ok) throw new Error('Failed to fetch data sources');
  return res.json();
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}
