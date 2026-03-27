// TRACED: FD-AUTH-001 — Auth controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto = { email: 'a@b.com', password: 'pass123', organizationName: 'Org' };
      const expected = { accessToken: 'tok', user: { id: '1', email: 'a@b.com' } };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('should propagate error on duplicate email conflict', async () => {
      const dto = { email: 'dup@b.com', password: 'pass', organizationName: 'Org' };
      mockAuthService.register.mockRejectedValue(new Error('Conflict'));

      await expect(controller.register(dto)).rejects.toThrow('Conflict');
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto = { email: 'a@b.com', password: 'pass123' };
      const expected = { accessToken: 'tok', user: { id: '1' } };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('should propagate error on invalid credentials', async () => {
      const dto = { email: 'bad@b.com', password: 'wrong' };
      mockAuthService.login.mockRejectedValue(new Error('Unauthorized'));

      await expect(controller.login(dto)).rejects.toThrow('Unauthorized');
    });
  });
});
