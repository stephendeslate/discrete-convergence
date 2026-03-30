'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_ROUTES } from './routes';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// TRACED: FD-FI-002
export async function loginAction(formData: FormData) {
  const res = await fetch(`${API_URL}${API_ROUTES.AUTH_LOGIN}`, {
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
export async function registerAction(formData: FormData) {
  const res = await fetch(`${API_URL}${API_ROUTES.AUTH_REGISTER}`, {
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

async function authenticatedFetch(path: string, options?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

// TRACED: FD-VEH-003
export async function getVehicles(page = 1, pageSize = 20) {
  return authenticatedFetch(
    `${API_ROUTES.VEHICLES}?page=${page}&pageSize=${pageSize}`,
  );
}

export async function createVehicle(formData: FormData) {
  return authenticatedFetch(API_ROUTES.VEHICLES, {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      licensePlate: formData.get('licensePlate'),
      make: formData.get('make'),
      model: formData.get('model'),
      year: Number(formData.get('year')),
    }),
  });
}

// TRACED: FD-DRV-003
export async function getDrivers(page = 1, pageSize = 20) {
  return authenticatedFetch(
    `${API_ROUTES.DRIVERS}?page=${page}&pageSize=${pageSize}`,
  );
}

export async function createDriver(formData: FormData) {
  return authenticatedFetch(API_ROUTES.DRIVERS, {
    method: 'POST',
    body: JSON.stringify({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      licenseNumber: formData.get('licenseNumber'),
    }),
  });
}

// TRACED: FD-DISP-003
export async function getDispatches(page = 1, pageSize = 20) {
  return authenticatedFetch(
    `${API_ROUTES.DISPATCHES}?page=${page}&pageSize=${pageSize}`,
  );
}

export async function createDispatch(formData: FormData) {
  return authenticatedFetch(API_ROUTES.DISPATCHES, {
    method: 'POST',
    body: JSON.stringify({
      title: formData.get('title'),
      description: formData.get('description'),
      priority: Number(formData.get('priority') ?? '0'),
    }),
  });
}

// TRACED: FD-ROUTE-003
export async function getRoutes(page = 1, pageSize = 20) {
  return authenticatedFetch(
    `${API_ROUTES.ROUTES}?page=${page}&pageSize=${pageSize}`,
  );
}

export async function createRoute(formData: FormData) {
  return authenticatedFetch(API_ROUTES.ROUTES, {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      origin: formData.get('origin'),
      destination: formData.get('destination'),
    }),
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function reportError(error: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return;
  }

  await fetch(`${API_URL}/errors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ error, timestamp: new Date().toISOString() }),
  });
}
