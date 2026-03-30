// TRACED:WEB-API-SPEC

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Must import after setting up mock
import { login, register, fetchEvents, fetchVenues, createEvent, createVenue, fetchProfile } from '../lib/api';

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('login', () => {
    it('should POST to /auth/login and return tokens', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'at', refreshToken: 'rt' }),
      });

      const result = await login('test@test.com', 'password');
      expect(result.accessToken).toBe('at');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should throw on HTTP error (error path)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      await expect(login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('should POST to /auth/register', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'u1', email: 'test@test.com', role: 'VIEWER' }),
      });

      const result = await register('test@test.com', 'Pass1', 'org-1');
      expect(result.email).toBe('test@test.com');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('fetchProfile', () => {
    it('should GET /auth/me with auth header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'u1', email: 'test@test.com' }),
      });

      const result = await fetchProfile('my-token');
      expect(result.id).toBe('u1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
        }),
      );
    });
  });

  describe('fetchEvents', () => {
    it('should GET /events with pagination', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { page: 1, pageSize: 20, total: 0 } }),
      });

      const result = await fetchEvents('token', 2);
      expect(result.meta.page).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/events?page=2'),
        expect.anything(),
      );
    });
  });

  describe('fetchVenues', () => {
    it('should GET /venues with auth', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { page: 1, pageSize: 20, total: 0 } }),
      });

      const result = await fetchVenues('token');
      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/venues'),
        expect.anything(),
      );
    });
  });

  describe('createEvent', () => {
    it('should POST /events with body and token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'e1', title: 'New Event' }),
      });

      const result = await createEvent('token', {
        title: 'New Event',
        startDate: '2024-06-15T09:00:00Z',
        endDate: '2024-06-17T17:00:00Z',
      });
      expect(result.title).toBe('New Event');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/events'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('createVenue', () => {
    it('should POST /venues with body and token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'v1', name: 'New Venue' }),
      });

      const result = await createVenue('token', {
        name: 'New Venue',
        address: '123 Main',
        capacity: 500,
      });
      expect(result.name).toBe('New Venue');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/venues'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
