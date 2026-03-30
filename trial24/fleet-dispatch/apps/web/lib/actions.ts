// TRACED:WEB-ACTIONS
'use server';

import { apiFetch } from './api';
import type { Vehicle, Driver, PaginatedResponse } from './api';
import { cookies } from 'next/headers';

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) {
    throw new Error('Not authenticated');
  }
  return token;
}

// ── Auth Actions ──────────────────────────────────────

export async function loginAction(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiFetch<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );

    const cookieStore = await cookies();
    cookieStore.set('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900, // 15 minutes
    });
    cookieStore.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800, // 7 days
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function registerAction(
  email: string,
  password: string,
  companyId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiFetch<{ accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, companyId }),
      },
    );

    const cookieStore = await cookies();
    cookieStore.set('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ── Vehicle Actions ──────────────────────────────────

export async function fetchVehicles(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Vehicle>> {
  const token = await getToken();
  return apiFetch<PaginatedResponse<Vehicle>>(
    `/vehicles?page=${page}&limit=${limit}`,
    { token },
  );
}

export async function createVehicleAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getToken();
    await apiFetch<Vehicle>('/vehicles', {
      method: 'POST',
      token,
      body: JSON.stringify({
        vin: formData.get('vin'),
        make: formData.get('make'),
        model: formData.get('model'),
        year: Number(formData.get('year')),
        licensePlate: formData.get('licensePlate'),
      }),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ── Driver Actions ───────────────────────────────────

export async function fetchDrivers(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Driver>> {
  const token = await getToken();
  return apiFetch<PaginatedResponse<Driver>>(
    `/drivers?page=${page}&limit=${limit}`,
    { token },
  );
}

export async function createDriverAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getToken();
    await apiFetch<Driver>('/drivers', {
      method: 'POST',
      token,
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        licenseNumber: formData.get('licenseNumber'),
      }),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ── Dispatch Actions ─────────────────────────────────

export async function createDispatchAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getToken();
    await apiFetch('/dispatches', {
      method: 'POST',
      token,
      body: JSON.stringify({
        vehicleId: formData.get('vehicleId'),
        driverId: formData.get('driverId'),
        routeId: formData.get('routeId'),
        scheduledAt: formData.get('scheduledAt'),
      }),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteVehicleAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getToken();
    await apiFetch<void>(`/vehicles/${id}`, {
      method: 'DELETE',
      token,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateVehicleAction(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getToken();
    await apiFetch<Vehicle>(`/vehicles/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        make: formData.get('make'),
        model: formData.get('model'),
        year: Number(formData.get('year')),
        licensePlate: formData.get('licensePlate'),
      }),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
