'use server';

import { cookies } from 'next/headers';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';
const TOKEN_COOKIE = 'fd-token';

// --- Auth helpers ---

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<{
  sub: string;
  email: string;
  role: string;
  tenantId: string;
} | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64').toString(),
    ) as { sub: string; email: string; role: string; tenantId: string };
    return payload;
  } catch {
    return null;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((body['message'] as string) ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Auth actions ---

export async function loginAction(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiFetch<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
  }
}

export async function registerAction(
  email: string,
  password: string,
  name: string,
  role: string,
  tenantId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiFetch<{ accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role, tenantId }),
    });
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

// --- Data fetching ---

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export interface DriverRecord {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  available: boolean;
  vehicleId: string | null;
  tenantId: string;
  createdAt: string;
}

export interface VehicleRecord {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: string;
  mileage: string;
  tenantId: string;
  createdAt: string;
}

export interface DeliveryRecord {
  id: string;
  trackingCode: string;
  status: string;
  recipientName: string;
  address: string;
  cost: string;
  driverId: string | null;
  vehicleId: string | null;
  routeId: string | null;
  tenantId: string;
  createdAt: string;
  driver?: DriverRecord | null;
  vehicle?: VehicleRecord | null;
}

export interface RouteRecord {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: string;
  estimatedMinutes: number;
  tenantId: string;
  createdAt: string;
}

export async function fetchDrivers(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<DriverRecord>> {
  return apiFetch(`/drivers?page=${page}&pageSize=${pageSize}`);
}

export async function fetchDriver(id: string): Promise<DriverRecord> {
  return apiFetch(`/drivers/${id}`);
}

export async function fetchVehicles(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<VehicleRecord>> {
  return apiFetch(`/vehicles?page=${page}&pageSize=${pageSize}`);
}

export async function fetchDeliveries(
  page = 1,
  pageSize = 20,
  status?: string,
): Promise<PaginatedResponse<DeliveryRecord>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set('status', status);
  return apiFetch(`/deliveries?${params.toString()}`);
}

export async function fetchDelivery(id: string): Promise<DeliveryRecord> {
  return apiFetch(`/deliveries/${id}`);
}

export async function fetchRoutes(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<RouteRecord>> {
  return apiFetch(`/routes?page=${page}&pageSize=${pageSize}`);
}

// --- Mutations ---

export async function createDriver(data: {
  name: string;
  licenseNumber: string;
  phone: string;
  vehicleId?: string;
}): Promise<DriverRecord> {
  return apiFetch('/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createVehicle(data: {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
}): Promise<VehicleRecord> {
  return apiFetch('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createDelivery(data: {
  trackingCode: string;
  recipientName: string;
  address: string;
  cost: number;
  driverId?: string;
  vehicleId?: string;
  routeId?: string;
}): Promise<DeliveryRecord> {
  return apiFetch('/deliveries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createRoute(data: {
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  waypoints?: unknown[];
}): Promise<RouteRecord> {
  return apiFetch('/routes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
