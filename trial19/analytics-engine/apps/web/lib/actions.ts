'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const API_ROUTES = {
  DASHBOARDS: '/dashboards',
  DATA_SOURCES: '/data-sources',
  WIDGETS: '/widgets',
} as const;

// TRACED: AE-FE-003
export async function login(_prevState: { error: string }, formData: FormData) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    if (!res.ok) {
      return { error: 'Invalid email or password' };
    }

    const data = await res.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' });
  } catch {
    return { error: 'Failed to connect to server' };
  }
  redirect('/dashboard');
}

// TRACED: AE-FE-004
export async function register(_prevState: { error: string }, formData: FormData) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        role: 'USER',
      }),
    });

    if (!res.ok) {
      return { error: 'Registration failed' };
    }

    const data = await res.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' });
  } catch {
    return { error: 'Failed to connect to server' };
  }
  redirect('/dashboard');
}

// TRACED: AE-CROSS-003
async function authenticatedFetch(path: string, options: RequestInit = {}) {
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
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export async function getDashboards() {
  return authenticatedFetch(API_ROUTES.DASHBOARDS);
}

export async function getDashboard(id: string) {
  return authenticatedFetch(`${API_ROUTES.DASHBOARDS}/${id}`);
}

export async function createDashboard(formData: FormData) {
  return authenticatedFetch(API_ROUTES.DASHBOARDS, {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      description: formData.get('description'),
    }),
  });
}

export async function getDataSources() {
  return authenticatedFetch(API_ROUTES.DATA_SOURCES);
}

export async function createDataSource(formData: FormData) {
  return authenticatedFetch(API_ROUTES.DATA_SOURCES, {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      type: formData.get('type'),
    }),
  });
}

export async function getWidgets() {
  return authenticatedFetch(API_ROUTES.WIDGETS);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
