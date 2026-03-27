// TRACED: EM-FE-002 — Server actions for data mutations
'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// TRACED: EM-FE-003 — Create event server action
export async function createEvent(token: string, data: {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  venueId?: string;
}): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      return { success: false, error: body.message || 'Failed to create event' };
    }

    return { success: true, data: await res.json() };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: EM-FE-004 — Update event server action
export async function updateEvent(
  token: string,
  eventId: string,
  data: Record<string, unknown>,
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      return { success: false, error: body.message || 'Failed to update event' };
    }

    return { success: true, data: await res.json() };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: EM-FE-005 — Delete event server action
export async function deleteEvent(
  token: string,
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const body = await res.json();
      return { success: false, error: body.message || 'Failed to delete event' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: EM-FE-013 — Fetch events server action
export async function fetchEvents(token: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to fetch events' };
    }

    return { success: true, data: await res.json() };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: EM-FE-014 — Fetch venues server action
export async function fetchVenues(token: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/venues`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to fetch venues' };
    }

    return { success: true, data: await res.json() };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: EM-FE-016 — Fetch audit log server action
export async function fetchAuditLog(token: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/audit-log`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to fetch audit log' };
    }

    return { success: true, data: await res.json() };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: EM-FE-006 — Create venue server action
export async function createVenue(token: string, data: {
  name: string;
  address: string;
  capacity: number;
}): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      return { success: false, error: body.message || 'Failed to create venue' };
    }

    return { success: true, data: await res.json() };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
