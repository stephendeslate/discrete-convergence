// TRACED:FD-FE-005 — Server actions with 'use server' directive and response.ok check
'use server';

import { redirect } from 'next/navigation';

const ROUTE_DASHBOARD = '/dashboard';
const ROUTE_LOGIN = '/login';
const ROUTE_VEHICLES = '/vehicles';
const ROUTE_DRIVERS = '/drivers';
const ROUTE_ROUTES = '/routes';
const ROUTE_DISPATCHES = '/dispatches';
const ROUTE_MAINTENANCE = '/maintenance';

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${process.env['API_URL']}${path}`, options);
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<Response> {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await apiPost('/auth/login', { email, password });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

  redirect(ROUTE_DASHBOARD);
}

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  const response = await apiPost('/auth/register', { email, password, role });

  if (!response.ok) {
    return { error: 'Registration failed' };
  }

  redirect(ROUTE_LOGIN);
}

interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  status: string;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface FleetRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

interface Dispatch {
  id: string;
  status: string;
  vehicleId: string;
  driverId: string;
}

interface MaintenanceRecord {
  id: string;
  type: string;
  description: string;
  vehicleId: string;
}

async function fetchListData<T>(path: string): Promise<T[]> {
  const response = await apiFetch(path, { cache: 'no-store' });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.items ?? [];
}

export async function getVehicles(): Promise<Vehicle[]> {
  return fetchListData<Vehicle>(ROUTE_VEHICLES);
}

export async function getDrivers(): Promise<Driver[]> {
  return fetchListData<Driver>(ROUTE_DRIVERS);
}

export async function getRoutes(): Promise<FleetRoute[]> {
  return fetchListData<FleetRoute>(ROUTE_ROUTES);
}

export async function getDispatches(): Promise<Dispatch[]> {
  return fetchListData<Dispatch>(ROUTE_DISPATCHES);
}

export async function getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  return fetchListData<MaintenanceRecord>(ROUTE_MAINTENANCE);
}
