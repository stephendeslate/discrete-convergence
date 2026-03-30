// TRACED: FD-FE-001 — Server actions call API with cookie-based auth token
// TRACED: FD-FE-002 — All fetch calls include credentials and error handling
'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  return res;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res = await authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message ?? 'Login failed' };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });

  return { success: true };
}

export async function register(email: string, password: string, name: string, role: string): Promise<{ success: boolean; error?: string }> {
  const res = await authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message ?? 'Registration failed' };
  }

  return { success: true };
}

export async function getWorkOrders(page = 1, limit = 20): Promise<{ data: unknown[]; meta: unknown }> {
  const res = await authFetch(`/work-orders?page=${page}&limit=${limit}`);
  if (!res.ok) return { data: [], meta: {} };
  return res.json();
}

export async function getWorkOrder(id: string): Promise<unknown> {
  const res = await authFetch(`/work-orders/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getTechnicians(page = 1, limit = 20): Promise<{ data: unknown[]; meta: unknown }> {
  const res = await authFetch(`/technicians?page=${page}&limit=${limit}`);
  if (!res.ok) return { data: [], meta: {} };
  return res.json();
}

export async function getCustomers(page = 1, limit = 20): Promise<{ data: unknown[]; meta: unknown }> {
  const res = await authFetch(`/customers?page=${page}&limit=${limit}`);
  if (!res.ok) return { data: [], meta: {} };
  return res.json();
}

export async function getRoutes(page = 1, limit = 20): Promise<{ data: unknown[]; meta: unknown }> {
  const res = await authFetch(`/routes?page=${page}&limit=${limit}`);
  if (!res.ok) return { data: [], meta: {} };
  return res.json();
}

export async function getDashboards(): Promise<{ data: unknown[]; meta: unknown }> {
  const res = await authFetch('/dashboards');
  if (!res.ok) return { data: [], meta: {} };
  return res.json();
}

export async function getDataSources(): Promise<{ data: unknown[]; meta: unknown }> {
  const res = await authFetch('/data-sources');
  if (!res.ok) return { data: [], meta: {} };
  return res.json();
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
