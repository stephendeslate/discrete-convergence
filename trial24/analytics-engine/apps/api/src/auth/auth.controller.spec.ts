// TRACED:AUTH-CONTROLLER-SPEC
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const tokenPair = { accessToken: 'at', refreshToken: 'rt' };

  beforeEach(() => {
    authService = {
      register: jest.fn().mockResolvedValue(tokenPair),
      login: jest.fn().mockResolvedValue(tokenPair),
      refresh: jest.fn().mockResolvedValue(tokenPair),
    } as unknown as jest.Mocked<AuthService>;
    controller = new AuthController(authService);
  });

  describe('register', () => {
    it('should delegate to authService.register', async () => {
      const dto = { email: 'a@b.com', password: 'pass1234', tenantId: 't-1' };
      const result = await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith('a@b.com', 'pass1234', 't-1');
      expect(result).toEqual(tokenPair);
    });
  });

  describe('login', () => {
    it('should delegate to authService.login', async () => {
      const dto = { email: 'a@b.com', password: 'pass1234' };
      const result = await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith('a@b.com', 'pass1234');
      expect(result).toEqual(tokenPair);
    });
  });

  describe('refresh', () => {
    it('should extract user and delegate to authService.refresh', async () => {
      const req = { user: { sub: 'u-1', email: 'a@b.com', role: 'VIEWER', tenantId: 't-1' } } as unknown as Request;
      const result = await controller.refresh(req);
      expect(authService.refresh).toHaveBeenCalledWith('u-1');
      expect(result).toEqual(tokenPair);
    });
  });
});
