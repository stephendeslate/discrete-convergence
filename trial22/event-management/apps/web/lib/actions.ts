'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEFAULT_PAGE_SIZE } from '@repo/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

async function authedFetch(path: string, init?: RequestInit) {
  const token = await getToken();
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: 'no-store',
  });
  if (res.status === 401) {
    redirect('/login');
  }
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Login failed');
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });
  return data;
}

export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Registration failed');
  return data;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function getDashboard() {
  return authedFetch('/dashboards');
}

export async function getEvents(page = 1, limit = DEFAULT_PAGE_SIZE) {
  return authedFetch(`/events?page=${page}&limit=${limit}`);
}

export async function getVenues(page = 1, limit = DEFAULT_PAGE_SIZE) {
  return authedFetch(`/venues?page=${page}&limit=${limit}`);
}

export async function getTickets(page = 1, limit = DEFAULT_PAGE_SIZE) {
  return authedFetch(`/tickets?page=${page}&limit=${limit}`);
}

export async function getAttendees(page = 1, limit = DEFAULT_PAGE_SIZE) {
  return authedFetch(`/attendees?page=${page}&limit=${limit}`);
}

export async function getDataSources() {
  return authedFetch('/data-sources');
}
