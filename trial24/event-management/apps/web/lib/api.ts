// TRACED:WEB-API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface ApiOptions {
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorBody.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  organizationId: string;
}

export interface VenueItem {
  id: string;
  name: string;
  address: string;
  capacity: number;
  organizationId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(
  email: string,
  password: string,
  organizationId: string,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { email, password, organizationId },
  });
}

export function fetchProfile(token: string): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/me', { token });
}

export function fetchEvents(token: string, page = 1): Promise<PaginatedResponse<EventItem>> {
  return apiFetch<PaginatedResponse<EventItem>>(`/events?page=${page}`, { token });
}

export function createEvent(
  token: string,
  data: { title: string; startDate: string; endDate: string; description?: string },
): Promise<EventItem> {
  return apiFetch<EventItem>('/events', { method: 'POST', body: data, token });
}

export function fetchVenues(token: string, page = 1): Promise<PaginatedResponse<VenueItem>> {
  return apiFetch<PaginatedResponse<VenueItem>>(`/venues?page=${page}`, { token });
}

export function createVenue(
  token: string,
  data: { name: string; address: string; capacity: number },
): Promise<VenueItem> {
  return apiFetch<VenueItem>('/venues', { method: 'POST', body: data, token });
}
