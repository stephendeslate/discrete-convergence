// TRACED: AE-FE-001 — token stored via httpOnly cookie
// TRACED: AE-FE-002 — server actions send Authorization header
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE = process.env.API_URL ?? 'http://localhost:3001';

interface AuthResponse {
  access_token: string;
}

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function loginAction(
  formData: FormData,
): Promise<ActionResult<AuthResponse>> {
  const email = formData.get('email');
  const password = formData.get('password');

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message ?? 'Login failed' };
  }

  const data: AuthResponse = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
  });

  return { success: true, data };
}

export async function registerAction(
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get('email');
  const password = formData.get('password');

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message ?? 'Registration failed' };
  }

  return { success: true };
}

async function authenticatedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function getDashboards(): Promise<ActionResult> {
  const res = await authenticatedFetch('/dashboards');

  if (!res.ok) {
    return { success: false, error: 'Failed to fetch dashboards' };
  }

  const data = await res.json();
  return { success: true, data };
}

export async function getDataSources(): Promise<ActionResult> {
  const res = await authenticatedFetch('/data-sources');

  if (!res.ok) {
    return { success: false, error: 'Failed to fetch data sources' };
  }

  const data = await res.json();
  return { success: true, data };
}

export async function createDashboard(
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get('name');
  const description = formData.get('description');

  const res = await authenticatedFetch('/dashboards', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message ?? 'Failed to create dashboard' };
  }

  const data = await res.json();
  return { success: true, data };
}

export async function deleteDashboard(id: string): Promise<ActionResult> {
  const res = await authenticatedFetch(`/dashboards/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    return { success: false, error: 'Failed to delete dashboard' };
  }

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
