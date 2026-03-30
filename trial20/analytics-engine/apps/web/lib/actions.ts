'use server';

import { cookies } from 'next/headers';

const API_BASE = process.env.API_URL ?? 'http://localhost:3001';

// TRACED: AE-FE-004 — Server action for login with cookie-based token storage
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message ?? 'Login failed' };
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

  return { success: true };
}

// TRACED: AE-FE-005 — Server action for registration
export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'VIEWER' }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message ?? 'Registration failed' };
  }

  return { success: true };
}

// TRACED: AE-FE-006 — Server action for logout
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

// TRACED: AE-EDGE-011 — Missing auth cookie redirects to login prompt on protected pages
async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { error: 'Not authenticated', data: null };
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message ?? 'Request failed', data: null };
  }

  const data = await res.json();
  return { error: null, data };
}

// TRACED: AE-FE-007 — Fetch dashboards with auth header
export async function getDashboards(page = 1, limit = 20) {
  return authenticatedFetch(`/dashboards?page=${page}&limit=${limit}`);
}

// TRACED: AE-FE-008 — Fetch data sources with auth header
export async function getDataSources(page = 1, limit = 20) {
  return authenticatedFetch(`/data-sources?page=${page}&limit=${limit}`);
}

// TRACED: AE-FE-009 — Fetch widgets by dashboard with auth header
export async function getWidgets(dashboardId: string) {
  return authenticatedFetch(`/widgets?dashboardId=${dashboardId}`);
}

// TRACED: AE-FE-010 — Create dashboard server action
export async function createDashboard(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  return authenticatedFetch('/dashboards', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

// TRACED: AE-FE-011 — Create data source server action
export async function createDataSource(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const connectionString = formData.get('connectionString') as string;

  return authenticatedFetch('/data-sources', {
    method: 'POST',
    body: JSON.stringify({ name, type, connectionString }),
  });
}
