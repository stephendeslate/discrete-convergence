// TRACED:TEST-AUTH-CTRL — Auth controller unit tests
// VERIFY:FD-CTRL-001 — AuthController register returns tokens
// VERIFY:FD-CTRL-002 — AuthController login returns tokens
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register', async () => {
    const dto = { email: 'test@test.com', password: 'password123', tenantId: 't1' };
    mockService.register.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
    const result = await controller.register(dto);
    expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    expect(mockService.register).toHaveBeenCalledWith(dto);
  });

  it('should call login', async () => {
    const dto = { email: 'test@test.com', password: 'password123' };
    mockService.login.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
    const result = await controller.login(dto);
    expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    expect(mockService.login).toHaveBeenCalledWith(dto);
  });

  it('should call refresh', async () => {
    const dto = { refreshToken: 'rt' };
    mockService.refresh.mockResolvedValue({ accessToken: 'at2', refreshToken: 'rt2' });
    const result = await controller.refresh(dto);
    expect(result).toEqual({ accessToken: 'at2', refreshToken: 'rt2' });
    expect(mockService.refresh).toHaveBeenCalledWith('rt');
  });
});
