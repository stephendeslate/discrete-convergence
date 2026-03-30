'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// TRACED: FD-FI-001
const API_ROUTES = {
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  ROUTES: '/routes',
  DISPATCHES: '/dispatches',
  MAINTENANCE: '/maintenance',
} as const;

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';

// TRACED: FD-FI-002
export async function loginAction(formData: FormData): Promise<void> {
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

// TRACED: FD-FI-003
export async function registerAction(formData: FormData): Promise<void> {
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

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
  });

  redirect('/dashboard');
}

// TRACED: FD-FI-004
export async function getVehicles(): Promise<unknown> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${API_ROUTES.VEHICLES}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  return res.json();
}

export async function getDrivers(): Promise<unknown> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${API_ROUTES.DRIVERS}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch drivers');
  }

  return res.json();
}

export async function getRoutes(): Promise<unknown> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${API_ROUTES.ROUTES}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch routes');
  }

  return res.json();
}

export async function getDispatches(): Promise<unknown> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${API_ROUTES.DISPATCHES}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dispatches');
  }

  return res.json();
}

export async function getMaintenance(): Promise<unknown> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${API_ROUTES.MAINTENANCE}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch maintenance records');
  }

  return res.json();
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function reportError(error: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  await fetch(`${API_URL}/errors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ error, timestamp: new Date().toISOString() }),
  });
}
