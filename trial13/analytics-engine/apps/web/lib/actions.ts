'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// TRACED: AE-FE-007
// TRACED: AE-CROSS-002

const API_ROUTES = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  DASHBOARDS: '/dashboards',
  WIDGETS: '/widgets',
  DATA_SOURCES: '/data-sources',
} as const;

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function loginAction(formData: FormData) {
  const res = await fetch(`${API_URL}${API_ROUTES.AUTH_LOGIN}`, {
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
  const res = await fetch(`${API_URL}${API_ROUTES.AUTH_REGISTER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      tenantId: formData.get('tenantId'),
      role: 'VIEWER',
    }),
  });

  if (!res.ok) {
    throw new Error('Registration failed');
  }

  redirect('/login');
}

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

export async function reportError(error: { message: string; stack?: string }) {
  try {
    await fetch(`${API_URL}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Silently fail error reporting
  }
}
