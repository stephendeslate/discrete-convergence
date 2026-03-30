'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const API_ROUTES = {
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  ROUTES: '/routes',
  DISPATCHES: '/dispatches',
  DASHBOARDS: '/dashboards',
  DATA_SOURCES: '/data-sources',
} as const;

// TRACED: FD-FI-001
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
  cookieStore.set('token', data.access_token, { httpOnly: true, secure: true, path: '/' });
  redirect('/dashboard');
}

// TRACED: FD-FI-002
export async function registerAction(formData: FormData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: formData.get('role'),
      tenantId: formData.get('tenantId'),
    }),
  });

  if (!res.ok) {
    throw new Error('Registration failed');
  }

  redirect('/login');
}

// TRACED: FD-FI-003
async function authenticatedFetch(path: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return res.json();
}

export async function getVehicles() {
  return authenticatedFetch(API_ROUTES.VEHICLES);
}

export async function getDrivers() {
  return authenticatedFetch(API_ROUTES.DRIVERS);
}

export async function getRoutes() {
  return authenticatedFetch(API_ROUTES.ROUTES);
}

export async function getDispatches() {
  return authenticatedFetch(API_ROUTES.DISPATCHES);
}

export async function getDashboards() {
  return authenticatedFetch(API_ROUTES.DASHBOARDS);
}

export async function getDataSources() {
  return authenticatedFetch(API_ROUTES.DATA_SOURCES);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
