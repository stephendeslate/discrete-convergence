// TRACED:EM-FE-005 — Server actions with 'use server' directive and response.ok check
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  VENUES: '/venues',
  SETTINGS: '/settings',
} as const;

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${process.env['API_URL']}${path}`, { ...options, headers });
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<Response> {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await apiPost('/auth/login', { email, password });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

  const data = await response.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.accessToken, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
  });

  redirect(ROUTES.DASHBOARD);
}

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  const response = await apiPost('/auth/register', { email, password, role });

  if (!response.ok) {
    return { error: 'Registration failed' };
  }

  redirect(ROUTES.LOGIN);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect(ROUTES.LOGIN);
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
}

async function fetchListData<T>(path: string): Promise<T[]> {
  const response = await apiFetch(path, { cache: 'no-store' });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.data ?? [];
}

export async function getEvents(): Promise<Event[]> {
  return fetchListData<Event>('/events');
}

export async function getVenues(): Promise<Venue[]> {
  return fetchListData<Venue>('/venues');
}
