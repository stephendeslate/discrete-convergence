'use server';
// TRACED: FD-CROSS-001
// TRACED: FD-FE-004

import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? 'Login failed');
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });

  return data;
}

export async function register(email: string, password: string, name: string, role: string, tenantId: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, tenantId }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message ?? 'Registration failed');
  }

  return res.json();
}

export async function fetchVehicles(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/vehicles?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function fetchDrivers(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/drivers?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch drivers');
  return res.json();
}

export async function fetchRoutes(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/routes?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json();
}

export async function fetchTrips(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/trips?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

export async function fetchDispatches(page = 1, limit = 20) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dispatches?page=${page}&limit=${limit}`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch dispatches');
  return res.json();
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
}
