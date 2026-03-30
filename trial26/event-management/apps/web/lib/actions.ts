// TRACED:EM-FE-006
'use server';

import { cookies } from 'next/headers';
import { apiClient } from './api';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export async function login(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const result = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  const cookieStore = await cookies();
  cookieStore.set('token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600,
  });
  cookieStore.set('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
  });
}

export async function register(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const result = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
  const cookieStore = await cookies();
  cookieStore.set('token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600,
  });
  cookieStore.set('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
  });
}

export async function createEvent(formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const capacity = Number(formData.get('capacity'));
  await apiClient('/events', {
    method: 'POST',
    body: { title, slug, startDate, endDate, capacity },
  });
}

export async function updateEvent(id: string, formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  await apiClient(`/events/${id}`, {
    method: 'PUT',
    body: { title, description },
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient(`/events/${id}`, { method: 'DELETE' });
}

export async function createVenue(formData: FormData): Promise<void> {
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const capacity = Number(formData.get('capacity'));
  await apiClient('/venues', {
    method: 'POST',
    body: { name, address, city, capacity },
  });
}

export async function createTicket(formData: FormData): Promise<void> {
  const eventId = formData.get('eventId') as string;
  const type = formData.get('type') as string;
  const price = Number(formData.get('price'));
  await apiClient('/tickets', {
    method: 'POST',
    body: { eventId, type, price },
  });
}

// Aliases for consistent naming convention
export const loginAction = login;
export const registerAction = register;
export const createEventAction = createEvent;
export const createVenueAction = createVenue;
