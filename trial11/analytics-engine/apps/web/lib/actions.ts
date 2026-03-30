'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MAX_PAGE_SIZE } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const API_ROUTES = {
  DASHBOARDS: '/dashboards',
  DATA_SOURCES: '/data-sources',
  WIDGETS: '/widgets',
} as const;

// TRACED: AE-FI-001
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

// TRACED: AE-FI-002
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

async function authenticatedFetch(path: string, options?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  return res;
}

// TRACED: AE-FI-003
export async function getDashboards(page = 1) {
  const res = await authenticatedFetch(
    `${API_ROUTES.DASHBOARDS}?page=${page}&pageSize=${MAX_PAGE_SIZE}`,
  );
  if (!res.ok) {
    throw new Error('Failed to fetch dashboards');
  }
  return res.json();
}

export async function getDashboard(id: string) {
  const res = await authenticatedFetch(`${API_ROUTES.DASHBOARDS}/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard');
  }
  return res.json();
}

export async function createDashboard(formData: FormData) {
  const res = await authenticatedFetch(API_ROUTES.DASHBOARDS, {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      description: formData.get('description'),
      isPublic: formData.get('isPublic') === 'true',
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create dashboard');
  }
  redirect('/dashboard');
}

// TRACED: AE-FI-004
export async function getDataSources(page = 1) {
  const res = await authenticatedFetch(
    `${API_ROUTES.DATA_SOURCES}?page=${page}&pageSize=${MAX_PAGE_SIZE}`,
  );
  if (!res.ok) {
    throw new Error('Failed to fetch data sources');
  }
  return res.json();
}

export async function createDataSource(formData: FormData) {
  const res = await authenticatedFetch(API_ROUTES.DATA_SOURCES, {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      type: formData.get('type'),
      config: formData.get('config'),
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create data source');
  }
  redirect('/data-sources');
}

// TRACED: AE-FI-005
export async function getWidgets(page = 1) {
  const res = await authenticatedFetch(
    `${API_ROUTES.WIDGETS}?page=${page}&pageSize=${MAX_PAGE_SIZE}`,
  );
  if (!res.ok) {
    throw new Error('Failed to fetch widgets');
  }
  return res.json();
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
