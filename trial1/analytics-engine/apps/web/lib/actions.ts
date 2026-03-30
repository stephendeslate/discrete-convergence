// TRACED:AE-FE-005 — Server actions with 'use server' directive and response.ok check
'use server';

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

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await apiPost('/auth/login', { email, password });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

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
  name: string;
  description: string | null;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  syncStatus: string;
}

async function fetchListData<T>(path: string): Promise<T[]> {
  const response = await apiFetch(path, { cache: 'no-store' });
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
