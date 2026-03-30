'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

// TRACED: FD-UI-011
// TRACED: FD-UI-009
// TRACED: FD-UI-010

const API_ROUTES = {
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  DISPATCHES: '/dispatches',
} as const;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// TRACED: FD-AUTH-013
// TRACED: FD-UI-002
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

// TRACED: FD-UI-003
export async function registerAction(formData: FormData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      tenantId: formData.get('tenantId'),
    }),
  });
  if (!res.ok) {
    throw new Error('Registration failed');
  }
  redirect('/login');
}

export async function getVehicles() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.VEHICLES}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch vehicles');
  }
  return res.json();
}

export async function createVehicle(formData: FormData) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.VEHICLES}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: formData.get('name'),
      licensePlate: formData.get('licensePlate'),
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create vehicle');
  }
  redirect('/vehicles');
}

export async function getDrivers() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DRIVERS}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch drivers');
  }
  return res.json();
}

export async function createDriver(formData: FormData) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DRIVERS}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: formData.get('name'),
      licenseNumber: formData.get('licenseNumber'),
      phone: formData.get('phone'),
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create driver');
  }
  redirect('/drivers');
}

export async function getDispatches() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DISPATCHES}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch dispatches');
  }
  return res.json();
}

export async function createDispatch(formData: FormData) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${API_ROUTES.DISPATCHES}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      vehicleId: formData.get('vehicleId'),
      driverId: formData.get('driverId'),
      origin: formData.get('origin'),
      destination: formData.get('destination'),
      scheduledAt: formData.get('scheduledAt'),
      cost: Number(formData.get('cost')),
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to create dispatch');
  }
  redirect('/dispatches');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}
