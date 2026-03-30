import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; register: jest.Mock; refreshToken: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should delegate to AuthService.login with the dto', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const tokens = { access_token: 'access-token', refresh_token: 'refresh-token' };
      authService.login.mockResolvedValue(tokens);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(tokens);
    });
  });

  describe('register', () => {
    it('should delegate to AuthService.register with the dto', async () => {
      const dto = { email: 'test@example.com', password: 'password123', name: 'Test User', role: 'user' };
      const user = { id: 'user-1', email: dto.email, name: dto.name, role: dto.role };
      authService.register.mockResolvedValue(user);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(user);
    });
  });

  describe('refresh', () => {
    it('should delegate to AuthService.refreshToken with the dto', async () => {
      const dto = { refresh_token: 'valid-refresh-token' };
      const tokens = { access_token: 'new-access', refresh_token: 'new-refresh' };
      authService.refreshToken.mockResolvedValue(tokens);

      const result = await controller.refresh(dto);

      expect(authService.refreshToken).toHaveBeenCalledWith(dto);
      expect(result).toEqual(tokens);
    });
  });

  describe('error propagation', () => {
    it('should propagate service errors without catching them', async () => {
      const dto = { email: 'test@example.com', password: 'wrong' };
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await expect(controller.login(dto)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
