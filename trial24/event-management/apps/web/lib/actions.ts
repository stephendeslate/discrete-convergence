// TRACED:WEB-ACTIONS
'use server';

import { login, register, createEvent, createVenue } from './api';

export async function loginAction(
  formData: FormData,
): Promise<{ error?: string; accessToken?: string; refreshToken?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const result = await login(email, password);
    return { accessToken: result.accessToken, refreshToken: result.refreshToken };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Login failed' };
  }
}

export async function registerAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const organizationId = formData.get('organizationId') as string;

  if (!email || !password || !organizationId) {
    return { error: 'All fields are required' };
  }

  try {
    await register(email, password, organizationId);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Registration failed' };
  }
}

export async function createEventAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const token = formData.get('token') as string;
  const title = formData.get('title') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const description = formData.get('description') as string | null;

  if (!token) {
    return { error: 'Authentication required' };
  }

  if (!title || !startDate || !endDate) {
    return { error: 'Title, start date, and end date are required' };
  }

  try {
    await createEvent(token, {
      title,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      ...(description ? { description } : {}),
    });
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create event' };
  }
}

export async function deleteEventAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const token = formData.get('token') as string;
  const eventId = formData.get('eventId') as string;

  if (!token) {
    return { error: 'Authentication required' };
  }

  if (!eventId) {
    return { error: 'Event ID is required' };
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: 'Delete failed' }));
      return { error: body.message ?? 'Delete failed' };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to delete event' };
  }
}

export async function updateEventAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const token = formData.get('token') as string;
  const eventId = formData.get('eventId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;

  if (!token || !eventId) {
    return { error: 'Authentication and event ID are required' };
  }

  if (!title) {
    return { error: 'Title is required' };
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        ...(description ? { description } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: 'Update failed' }));
      return { error: body.message ?? 'Update failed' };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update event' };
  }
}

export async function createVenueAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const token = formData.get('token') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const capacityStr = formData.get('capacity') as string;

  if (!token) {
    return { error: 'Authentication required' };
  }

  if (!name || !address || !capacityStr) {
    return { error: 'Name, address, and capacity are required' };
  }

  const capacity = parseInt(capacityStr, 10);
  if (isNaN(capacity) || capacity <= 0) {
    return { error: 'Capacity must be a positive number' };
  }

  try {
    await createVenue(token, { name, address, capacity });
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create venue' };
  }
}
