import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  getProfile: jest.fn(),
};

describe('AuthController', () => {
  const controller = new AuthController(mockService as unknown as AuthService);

  beforeEach(() => jest.clearAllMocks());

  it('register delegates to service', async () => {
    mockService.register.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    await controller.register({ email: 'a@b.com', password: 'Pass1234', organizationId: 'o1' } as never);
    expect(mockService.register).toHaveBeenCalledWith('a@b.com', 'Pass1234', 'o1');
  });

  it('login delegates to service', async () => {
    mockService.login.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
    const result = await controller.login({ email: 'a@b.com', password: 'Pass1234' } as never);
    expect(result.accessToken).toBe('at');
    expect(mockService.login).toHaveBeenCalledWith('a@b.com', 'Pass1234');
  });

  it('refresh delegates to service', async () => {
    mockService.refresh.mockResolvedValue({ accessToken: 'new-at' });
    const result = await controller.refresh({ refreshToken: 'rt' } as never);
    expect(result.accessToken).toBe('new-at');
    expect(mockService.refresh).toHaveBeenCalledWith('rt');
  });

  it('me delegates to service with user sub', async () => {
    const req = { user: { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' } };
    mockService.getProfile.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    const result = await controller.me(req as never);
    expect(result.email).toBe('a@b.com');
    expect(mockService.getProfile).toHaveBeenCalledWith('u1');
  });
});
