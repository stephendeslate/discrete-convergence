import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ access_token: 'token' }),
      login: jest.fn().mockResolvedValue({ access_token: 'token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call register', async () => {
    const dto = { email: 'test@example.com', password: 'pass1234', name: 'Test', tenantName: 'T' };
    const result = await controller.register(dto);
    expect(result).toHaveProperty('access_token');
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should call login', async () => {
    const dto = { email: 'test@example.com', password: 'pass1234' };
    const result = await controller.login(dto);
    expect(result).toHaveProperty('access_token');
    expect(authService.login).toHaveBeenCalledWith(dto);
  });
});
