'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// TRACED: AE-FI-001
const API_ROUTES = {
  DASHBOARDS: '/dashboards',
  WIDGETS: '/widgets',
  DATA_SOURCES: '/data-sources',
} as const;

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// TRACED: AE-FI-002
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

// TRACED: AE-FI-003
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
  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
  });
  redirect('/dashboard');
}

// TRACED: AE-FI-004
export async function getDashboards() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${API_ROUTES.DASHBOARDS}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboards');
  }
  return res.json();
}

// TRACED: AE-FI-005
export async function getWidgets() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${API_ROUTES.WIDGETS}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch widgets');
  }
  return res.json();
}

// TRACED: AE-FI-006
export async function getDataSources() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${API_ROUTES.DATA_SOURCES}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch data sources');
  }
  return res.json();
}

export async function createDashboard(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  const res = await fetch(`${API_URL}${API_ROUTES.DASHBOARDS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: formData.get('title'),
      description: formData.get('description'),
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create dashboard');
  }
  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function reportFrontendError(error: { message: string; stack?: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  await fetch(`${API_URL}/errors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message: error.message }),
  }).catch(() => {
    // Silently fail error reporting
  });
}
