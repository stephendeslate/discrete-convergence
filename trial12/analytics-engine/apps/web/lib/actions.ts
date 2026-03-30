'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// TRACED: AE-FI-001
const API_ROUTES = {
  DASHBOARDS: '/dashboards',
  WIDGETS: '/widgets',
  DATA_SOURCES: '/data-sources',
  QUERIES: '/queries',
} as const;

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function loginAction(formData: FormData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  });
  if (!res.ok) {
    throw new Error('Login failed');
  }
  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
  });
  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: 'USER',
      tenantId: formData.get('tenantId'),
    }),
  });
  if (!res.ok) {
    throw new Error('Registration failed');
  }
  redirect('/login');
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  return { Authorization: `Bearer ${token}` };
}

// TRACED: AE-FI-002
export async function getDashboards() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DASHBOARDS}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboards');
  }
  return res.json();
}

export async function createDashboard(formData: FormData) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DASHBOARDS}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      description: formData.get('description'),
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create dashboard');
  }
  redirect('/dashboard');
}

export async function getWidgets() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.WIDGETS}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch widgets');
  }
  return res.json();
}

export async function getDataSources() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DATA_SOURCES}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch data sources');
  }
  return res.json();
}

export async function createDataSource(formData: FormData) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DATA_SOURCES}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      type: formData.get('type'),
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create data source');
  }
  redirect('/data-sources');
}

export async function getQueries() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.QUERIES}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch queries');
  }
  return res.json();
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
