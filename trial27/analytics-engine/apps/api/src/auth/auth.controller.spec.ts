import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto = { email: 'test@test.com', password: 'pass123', name: 'Test', tenantName: 'Acme' };
      const expected = { accessToken: 'token', user: { id: '1', email: 'test@test.com', name: 'Test' } };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(result).toEqual(expected);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto = { email: 'test@test.com', password: 'pass123' };
      const expected = { accessToken: 'token', user: { id: '1', email: 'test@test.com', name: 'Test' } };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
