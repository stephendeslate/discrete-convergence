import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
};

describe('AuthController', () => {
  const controller = new AuthController(mockService as unknown as AuthService);

  beforeEach(() => jest.clearAllMocks());

  it('register delegates to service', async () => {
    const dto = { email: 'a@b.com', password: 'password1', companyId: 'c1' };
    mockService.register.mockResolvedValue({ accessToken: 'tok' });
    const result = await controller.register(dto);
    expect(result.accessToken).toBe('tok');
    expect(mockService.register).toHaveBeenCalledWith(dto);
  });

  it('login delegates to service', async () => {
    const dto = { email: 'a@b.com', password: 'password1' };
    mockService.login.mockResolvedValue({ accessToken: 'tok' });
    const result = await controller.login(dto);
    expect(result.accessToken).toBe('tok');
  });

  it('refresh delegates to service', async () => {
    mockService.refresh.mockResolvedValue({ accessToken: 'new' });
    const result = await controller.refresh({ refreshToken: 'old' });
    expect(result.accessToken).toBe('new');
    expect(mockService.refresh).toHaveBeenCalledWith('old');
  });
});
