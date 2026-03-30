'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APP_VERSION, sanitizeLogContext } from '@fleet-dispatch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// TRACED: FD-AUTH-014
export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    redirect('/login?error=invalid');
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

// TRACED: FD-AUTH-015
export async function registerAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const tenantId = formData.get('tenantId') as string;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, tenantId }),
  });

  if (!res.ok) {
    redirect('/register?error=failed');
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

async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenCookie.value}`,
      ...options.headers,
    },
  });

  return res;
}

// TRACED: FD-VEH-015
export async function fetchVehicles(page = 1) {
  const res = await authenticatedFetch(`/vehicles?page=${page}`);
  if (!res.ok) return { data: [], total: 0, page: 1, pageSize: 20 };
  return res.json();
}

// TRACED: FD-DRV-008
export async function fetchDrivers(page = 1) {
  const res = await authenticatedFetch(`/drivers?page=${page}`);
  if (!res.ok) return { data: [], total: 0, page: 1, pageSize: 20 };
  return res.json();
}

// TRACED: FD-RTE-001
export async function fetchRoutes(page = 1) {
  const res = await authenticatedFetch(`/routes?page=${page}`);
  if (!res.ok) return { data: [], total: 0, page: 1, pageSize: 20 };
  return res.json();
}

// TRACED: FD-TRP-001
export async function fetchTrips(page = 1) {
  const res = await authenticatedFetch(`/trips?page=${page}`);
  if (!res.ok) return { data: [], total: 0, page: 1, pageSize: 20 };
  return res.json();
}

// TRACED: FD-MNT-001
export async function fetchMaintenance(page = 1) {
  const res = await authenticatedFetch(`/maintenance?page=${page}`);
  if (!res.ok) return { data: [], total: 0, page: 1, pageSize: 20 };
  return res.json();
}

export async function reportFrontendError(error: { message: string; stack?: string }) {
  const sanitized = sanitizeLogContext(error);
  try {
    await fetch(`${API_URL}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
  } catch {
    // Silently fail - don't cascade errors
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export function getAppVersion() {
  return APP_VERSION;
}
