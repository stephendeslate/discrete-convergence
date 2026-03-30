import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

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

  it('should call authService.register with dto', async () => {
    const dto = { email: 'a@b.com', password: 'pass', name: 'A', role: 'USER', tenantId: 't1' };
    mockAuthService.register.mockResolvedValue({ id: '1', email: 'a@b.com' });

    await controller.register(dto as RegisterDto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should call authService.login with dto', async () => {
    const dto = { email: 'a@b.com', password: 'pass' };
    mockAuthService.login.mockResolvedValue({ access_token: 'tok' });

    await controller.login(dto as LoginDto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });
});
