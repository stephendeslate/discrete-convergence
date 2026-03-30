'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// TRACED: FD-AUTH-007
async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// TRACED: FD-AUTH-008
export async function loginAction(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json();
    return { error: body.message ?? 'Login failed' };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });
  cookieStore.set('refresh_token', data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function registerAction(
  email: string,
  password: string,
  role: string,
  tenantId: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, tenantId }),
  });

  if (!res.ok) {
    const body = await res.json();
    return { error: body.message ?? 'Registration failed' };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  return { success: true };
}

export async function fetchVehicles() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/vehicles`, { headers, cache: 'no-store' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export async function fetchRoutes() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/routes`, { headers, cache: 'no-store' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export async function fetchDrivers() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/drivers`, { headers, cache: 'no-store' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export async function fetchDispatches() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dispatches`, { headers, cache: 'no-store' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export async function fetchDashboards() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dashboards`, { headers, cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchDataSources() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/data-sources`, { headers, cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}
