import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('should call register on auth service', async () => {
    const dto = { email: 'test@test.com', password: 'pass123456', role: 'VIEWER' as const, tenantId: 't1' };
    mockAuthService.register.mockResolvedValue({ access_token: 'tok' });
    const result = await controller.register(dto);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result.access_token).toBe('tok');
  });

  it('should call login on auth service', async () => {
    const dto = { email: 'test@test.com', password: 'pass123456' };
    mockAuthService.login.mockResolvedValue({ access_token: 'tok' });
    const result = await controller.login(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result.access_token).toBe('tok');
  });

  it('should call refreshToken on auth service', async () => {
    const req = { user: { sub: '1', email: 'a@b.com', role: 'VIEWER', tenantId: 't1' } };
    mockAuthService.refreshToken.mockResolvedValue({ access_token: 'new-tok' });
    const result = await controller.refresh(req as never);
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('1');
    expect(result.access_token).toBe('new-tok');
  });
});
