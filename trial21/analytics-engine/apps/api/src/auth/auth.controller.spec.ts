import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { login: jest.Mock; register: jest.Mock; refresh: jest.Mock };

  beforeEach(async () => {
    service = {
      login: jest.fn().mockResolvedValue({ access_token: 'at', refresh_token: 'rt' }),
      register: jest.fn().mockResolvedValue({ access_token: 'at', refresh_token: 'rt' }),
      refresh: jest.fn().mockResolvedValue({ access_token: 'at', refresh_token: 'rt' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call login with dto', async () => {
    const dto = { email: 'test@test.com', password: 'password123' };
    await controller.login(dto);
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('should call register with dto', async () => {
    const dto = { email: 'test@test.com', password: 'password123', name: 'Test', tenantName: 'Org', role: 'USER' };
    await controller.register(dto);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('should call refresh with token', async () => {
    await controller.refresh({ refreshToken: 'token' });
    expect(service.refresh).toHaveBeenCalledWith('token');
  });

  it('should return tokens from login', async () => {
    const result = await controller.login({ email: 'test@test.com', password: 'pass' });
    expect(result).toEqual({ access_token: 'at', refresh_token: 'rt' });
  });
});
