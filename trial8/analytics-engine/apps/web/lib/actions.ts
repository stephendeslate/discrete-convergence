// TRACED:AE-FE-005 — Server actions with 'use server' directive and response.ok check
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${process.env['API_URL']}${path}`, options);
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<Response> {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function authenticatedFetch(path: string, options?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return apiFetch(path, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  const response = await apiPost('/auth/register', { email, password, role });

  if (!response.ok) {
    return { error: 'Registration failed' };
  }

  redirect('/login');
}

interface Dashboard {
  id: string;
  title: string;
  description: string | null;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
}

async function fetchListData<T>(path: string): Promise<T[]> {
  const response = await authenticatedFetch(path, { cache: 'no-store' });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.data ?? [];
}

export async function getDashboards(): Promise<Dashboard[]> {
  return fetchListData<Dashboard>('/dashboards');
}

export async function getDataSources(): Promise<DataSource[]> {
  return fetchListData<DataSource>('/data-sources');
}
