import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return tokens from AuthService.login', async () => {
      const tokens = { access_token: 'at-123', refresh_token: 'rt-123' };
      mockAuthService.login.mockResolvedValue(tokens);

      const result = await controller.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toEqual(tokens);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('POST /auth/register', () => {
    it('should return user info from AuthService.register', async () => {
      const userInfo = { id: 'user-1', email: 'new@example.com', name: 'New User', role: 'ATTENDEE' };
      mockAuthService.register.mockResolvedValue(userInfo);

      const result = await controller.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'ATTENDEE',
      });

      expect(result).toEqual(userInfo);
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'ATTENDEE',
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new tokens from AuthService.refreshToken', async () => {
      const tokens = { access_token: 'new-at', refresh_token: 'new-rt' };
      mockAuthService.refreshToken.mockResolvedValue(tokens);

      const result = await controller.refresh({ refresh_token: 'old-refresh-token' });

      expect(result).toEqual(tokens);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith({
        refresh_token: 'old-refresh-token',
      });
    });
  });

  describe('error propagation', () => {
    it('should propagate errors from AuthService', async () => {
      const error = new Error('Service error');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow('Service error');
    });
  });
});
