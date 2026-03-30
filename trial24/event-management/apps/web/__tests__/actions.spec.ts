// TRACED:WEB-ACTIONS-SPEC
import { loginAction, registerAction, createEventAction, createVenueAction } from '../lib/actions';

// Mock the api module
jest.mock('../lib/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  createEvent: jest.fn(),
  createVenue: jest.fn(),
}));

const { login, register, createEvent, createVenue } = jest.requireMock('../lib/api');

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

describe('Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginAction', () => {
    it('should return tokens on successful login', async () => {
      login.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      const result = await loginAction(makeFormData({ email: 'test@test.com', password: 'Pass1' }));
      expect(result.accessToken).toBe('at');
      expect(result.refreshToken).toBe('rt');
      expect(login).toHaveBeenCalledWith('test@test.com', 'Pass1');
    });

    it('should return error on missing fields (empty input)', async () => {
      const result = await loginAction(makeFormData({}));
      expect(result.error).toBe('Email and password are required');
      expect(login).not.toHaveBeenCalled();
    });

    it('should return error on login failure', async () => {
      login.mockRejectedValue(new Error('Invalid credentials'));

      const result = await loginAction(makeFormData({ email: 'test@test.com', password: 'wrong' }));
      expect(result.error).toBe('Invalid credentials');
      expect(login).toHaveBeenCalledWith('test@test.com', 'wrong');
    });
  });

  describe('registerAction', () => {
    it('should return success on registration', async () => {
      register.mockResolvedValue({ id: 'u1', email: 'test@test.com' });

      const result = await registerAction(makeFormData({
        email: 'test@test.com',
        password: 'SecurePass1',
        organizationId: '00000000-0000-0000-0000-000000000001',
      }));
      expect(result.success).toBe(true);
      expect(register).toHaveBeenCalledWith('test@test.com', 'SecurePass1', '00000000-0000-0000-0000-000000000001');
    });

    it('should return error on missing fields (empty input)', async () => {
      const result = await registerAction(makeFormData({ email: 'test@test.com' }));
      expect(result.error).toBe('All fields are required');
      expect(register).not.toHaveBeenCalled();
    });

    it('should return error on duplicate registration failure', async () => {
      register.mockRejectedValue(new Error('Email already exists'));

      const result = await registerAction(makeFormData({
        email: 'dup@test.com',
        password: 'SecurePass1',
        organizationId: '00000000-0000-0000-0000-000000000001',
      }));
      expect(result.error).toBe('Email already exists');
      expect(register).toHaveBeenCalledWith('dup@test.com', 'SecurePass1', '00000000-0000-0000-0000-000000000001');
    });
  });

  describe('createEventAction', () => {
    it('should return success when event is created', async () => {
      createEvent.mockResolvedValue({ id: 'e1', title: 'Test' });

      const result = await createEventAction(makeFormData({
        token: 'valid-token',
        title: 'Test Event',
        startDate: '2024-06-15',
        endDate: '2024-06-17',
      }));
      expect(result.success).toBe(true);
      expect(createEvent).toHaveBeenCalledWith('valid-token', expect.objectContaining({ title: 'Test Event' }));
    });

    it('should return error without token (unauthorized)', async () => {
      const result = await createEventAction(makeFormData({
        title: 'Test Event',
        startDate: '2024-06-15',
        endDate: '2024-06-17',
      }));
      expect(result.error).toBe('Authentication required');
      expect(createEvent).not.toHaveBeenCalled();
    });

    it('should return error on missing title (empty input)', async () => {
      const result = await createEventAction(makeFormData({
        token: 'valid-token',
        startDate: '2024-06-15',
        endDate: '2024-06-17',
      }));
      expect(result.error).toBe('Title, start date, and end date are required');
      expect(createEvent).not.toHaveBeenCalled();
    });
  });

  describe('createVenueAction', () => {
    it('should return success when venue is created', async () => {
      createVenue.mockResolvedValue({ id: 'v1', name: 'Hall' });

      const result = await createVenueAction(makeFormData({
        token: 'valid-token',
        name: 'Main Hall',
        address: '123 Main St',
        capacity: '500',
      }));
      expect(result.success).toBe(true);
      expect(createVenue).toHaveBeenCalledWith('valid-token', expect.objectContaining({ name: 'Main Hall' }));
    });

    it('should return error for invalid capacity (boundary)', async () => {
      const result = await createVenueAction(makeFormData({
        token: 'valid-token',
        name: 'Bad Venue',
        address: '456 Elm St',
        capacity: '-10',
      }));
      expect(result.error).toBe('Capacity must be a positive number');
      expect(createVenue).not.toHaveBeenCalled();
    });

    it('should return error without token (unauthorized)', async () => {
      const result = await createVenueAction(makeFormData({
        name: 'Hall',
        address: '123 Main',
        capacity: '100',
      }));
      expect(result.error).toBe('Authentication required');
      expect(createVenue).not.toHaveBeenCalled();
    });
  });
});
