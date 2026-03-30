// TRACED:FD-WEB-002 — API client for fleet dispatch backend
// TRACED:FD-API-001 — API client makes GET by default
// TRACED:FD-API-002 — API client includes auth token
// TRACED:FD-API-003 — API client throws on non-ok response
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchVehicles(token: string, page = 1) {
  return apiFetch(`/vehicles?page=${page}`, { token });
}

export async function fetchDrivers(token: string, page = 1) {
  return apiFetch(`/drivers?page=${page}`, { token });
}

export async function fetchRoutes(token: string, page = 1) {
  return apiFetch(`/routes?page=${page}`, { token });
}

export async function fetchDispatches(token: string, page = 1) {
  return apiFetch(`/dispatches?page=${page}`, { token });
}

export async function fetchTrips(token: string, page = 1) {
  return apiFetch(`/trips?page=${page}`, { token });
}

export async function fetchMaintenance(token: string, page = 1) {
  return apiFetch(`/maintenance?page=${page}`, { token });
}

export async function fetchZones(token: string, page = 1) {
  return apiFetch(`/zones?page=${page}`, { token });
}
