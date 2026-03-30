// Unit tests
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock; refresh: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
      login: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
      refresh: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const result = await controller.register({ email: 'test@test.com', password: 'password123' });
    expect(result).toHaveProperty('accessToken');
    expect(authService.register).toHaveBeenCalled();
  });

  it('should login a user', async () => {
    const result = await controller.login({ email: 'test@test.com', password: 'password123' });
    expect(result).toHaveProperty('accessToken');
    expect(authService.login).toHaveBeenCalled();
  });

  it('should refresh tokens', async () => {
    const result = await controller.refresh({ refreshToken: 'old-token' });
    expect(result).toHaveProperty('accessToken');
    expect(authService.refresh).toHaveBeenCalledWith('old-token');
  });
});
