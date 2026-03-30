'use server';
// TRACED: FD-FI-001

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const API_ROUTES = {
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  DISPATCHES: '/dispatches',
  ROUTES: '/routes',
} as const;

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

async function authenticatedFetch(path: string, options?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

export async function getVehicles() {
  const res = await authenticatedFetch(API_ROUTES.VEHICLES);
  if (!res.ok) {
    throw new Error('Failed to fetch vehicles');
  }
  return res.json();
}

export async function getDrivers() {
  const res = await authenticatedFetch(API_ROUTES.DRIVERS);
  if (!res.ok) {
    throw new Error('Failed to fetch drivers');
  }
  return res.json();
}

export async function getDispatches() {
  const res = await authenticatedFetch(API_ROUTES.DISPATCHES);
  if (!res.ok) {
    throw new Error('Failed to fetch dispatches');
  }
  return res.json();
}

export async function getRoutes() {
  const res = await authenticatedFetch(API_ROUTES.ROUTES);
  if (!res.ok) {
    throw new Error('Failed to fetch routes');
  }
  return res.json();
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
