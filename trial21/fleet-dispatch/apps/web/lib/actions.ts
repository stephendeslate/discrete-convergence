'use server';

import { cookies } from 'next/headers';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

/**
 * Logs in user and stores token in cookie.
 * TRACED: FD-FE-001
 */
export async function loginAction(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    return { success: false, error: data.message ?? 'Login failed' };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });

  return { success: true };
}

/**
 * Registers user and stores token.
 * TRACED: FD-FE-002
 */
export async function registerAction(formData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role: string;
}): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const data = await res.json();
    return { success: false, error: data.message ?? 'Registration failed' };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('token', data.access_token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });

  return { success: true };
}

/**
 * Authenticated API fetch helper.
 * TRACED: FD-FE-003
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token.value}` } : {}),
      ...options.headers,
    },
  });
}

/**
 * Fetches work orders for the dashboard.
 * TRACED: FD-FE-004
 */
export async function getWorkOrders(page: number = 1, limit: number = 20) {
  const res = await apiFetch(`/work-orders?page=${page}&limit=${limit}`);
  if (!res.ok) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
  return res.json();
}

/**
 * Fetches technicians.
 * TRACED: FD-FE-005
 */
export async function getTechnicians(page: number = 1, limit: number = 20) {
  const res = await apiFetch(`/technicians?page=${page}&limit=${limit}`);
  if (!res.ok) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
  return res.json();
}

/**
 * Fetches customers.
 */
export async function getCustomers(page: number = 1, limit: number = 20) {
  const res = await apiFetch(`/customers?page=${page}&limit=${limit}`);
  if (!res.ok) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
  return res.json();
}

/**
 * Fetches invoices.
 */
export async function getInvoices(page: number = 1, limit: number = 20) {
  const res = await apiFetch(`/invoices?page=${page}&limit=${limit}`);
  if (!res.ok) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
  return res.json();
}

/**
 * Logs out by clearing the token cookie.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

/**
 * Fetches public tracking info.
 * TRACED: FD-FE-006
 */
export async function getTrackingInfo(token: string) {
  const res = await fetch(`${API_URL}/track/${token}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}
