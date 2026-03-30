import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  ALLOWED_REGISTRATION_ROLES: ['viewer', 'dispatcher'],
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
  createCorrelationId: jest.fn().mockReturnValue('corr-id'),
  formatLogEntry: jest.fn((e: unknown) => e),
  sanitizeLogContext: jest.fn((c: unknown) => c),
  validateEnvVars: jest.fn(),
  UserRole: { ADMIN: 'admin', VIEWER: 'viewer', DISPATCHER: 'dispatcher' },
  VehicleStatus: { AVAILABLE: 'available' },
  DriverStatus: { ACTIVE: 'active' },
  DispatchStatus: { PENDING: 'pending' },
  RouteStatus: { DRAFT: 'draft' },
}));

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
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

  it('should call authService.login with dto', async () => {
    const dto = { email: 'test@example.com', password: 'pass' };
    mockAuthService.login.mockResolvedValue({ access_token: 'tok' });

    const result = await controller.login(dto as LoginDto);

    expect(result).toEqual({ access_token: 'tok' });
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('should call authService.register with dto', async () => {
    const dto = { email: 'new@example.com', password: 'pass', role: 'viewer', tenantId: 't-1' };
    mockAuthService.register.mockResolvedValue({ id: 'u-1', email: dto.email, role: dto.role });

    const result = await controller.register(dto as RegisterDto);

    expect(result).toEqual({ id: 'u-1', email: dto.email, role: dto.role });
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });
});
