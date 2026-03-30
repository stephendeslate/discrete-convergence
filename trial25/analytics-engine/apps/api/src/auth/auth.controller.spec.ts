// TRACED:AUTH-CTRL-TEST — Auth controller tests
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: jest.Mock; login: jest.Mock; refresh: jest.Mock };

  beforeEach(() => {
    service = {
      register: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
      login: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
      refresh: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
    };
    controller = new AuthController(service as unknown as AuthService);
  });

  it('should register a user', async () => {
    const result = await controller.register({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.accessToken).toBe('at');
    expect(result.refreshToken).toBe('rt');
    expect(service.register).toHaveBeenCalledWith('test@test.com', 'password123', undefined);
  });

  it('should login a user', async () => {
    const result = await controller.login({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.accessToken).toBe('at');
    expect(result.refreshToken).toBe('rt');
    expect(service.login).toHaveBeenCalledWith('test@test.com', 'password123');
  });

  it('should refresh tokens', async () => {
    const result = await controller.refresh({ refreshToken: 'old-rt' });
    expect(result.accessToken).toBe('at');
    expect(result.refreshToken).toBe('rt');
    expect(service.refresh).toHaveBeenCalledWith('old-rt');
  });
});
