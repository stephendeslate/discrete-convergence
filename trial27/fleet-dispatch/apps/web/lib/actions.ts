// TRACED: FD-FE-001 — Server actions for write operations
'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface ActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

// TRACED: FD-FE-004 — Create vehicle action
export async function createVehicle(token: string, data: {
  name: string;
  licensePlate: string;
  type?: string;
}): Promise<ActionResult> {
  try {
    const res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || 'Failed to create vehicle' };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: FD-FE-005 — Update driver action
export async function updateDriver(token: string, id: string, data: {
  name?: string;
  email?: string;
  status?: string;
}): Promise<ActionResult> {
  try {
    const res = await fetch(`${API_URL}/drivers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || 'Failed to update driver' };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: FD-FE-006 — Delete dispatch job action
export async function deleteDispatchJob(token: string, id: string): Promise<ActionResult> {
  try {
    const res = await fetch(`${API_URL}/dispatch-jobs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || 'Failed to delete job' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// TRACED: FD-FE-006 — Cancel dispatch job action
export async function cancelDispatchJob(token: string, id: string): Promise<ActionResult> {
  try {
    const res = await fetch(`${API_URL}/dispatch-jobs/${id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || 'Failed to cancel job' };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
