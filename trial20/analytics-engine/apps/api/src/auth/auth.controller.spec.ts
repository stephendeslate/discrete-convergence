import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('should call register service method', async () => {
    const dto = { email: 'test@test.com', password: 'pass123!', role: 'VIEWER', tenantId: 't1' };
    mockService.register.mockResolvedValue({ id: 'u1', email: 'test@test.com' });

    const result = await controller.register(dto);

    expect(mockService.register).toHaveBeenCalledWith(dto);
    expect(result.email).toBe('test@test.com');
  });

  it('should call login service method', async () => {
    const dto = { email: 'test@test.com', password: 'pass123!' };
    mockService.login.mockResolvedValue({ access_token: 'jwt', refresh_token: 'rt' });

    const result = await controller.login(dto);

    expect(mockService.login).toHaveBeenCalledWith(dto);
    expect(result.access_token).toBe('jwt');
  });
});
