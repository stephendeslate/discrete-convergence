import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrisma } from './helpers/mock-prisma';
import { createTestUser, createTestCompany } from './helpers/factories';
import * as bcryptjs from 'bcryptjs';

jest.mock('bcryptjs');

describe('Auth Integration', () => {
  let module: TestingModule;
  let authService: AuthService;
  let jwtService: JwtService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('login -> token verification flow', () => {
    it('should produce a valid JWT on successful login', async () => {
      const user = createTestUser();
      prisma.user.findFirst.mockResolvedValue(user);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: user.email,
        password: 'password123',
      });

      const decoded = jwtService.verify(result.access_token);
      expect(decoded.sub).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      expect(decoded.tenantId).toBe(user.tenantId);
    });

    it('should include companyId in JWT payload', async () => {
      const user = createTestUser();
      prisma.user.findFirst.mockResolvedValue(user);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: user.email,
        password: 'password123',
      });

      const decoded = jwtService.verify(result.access_token);
      expect(decoded.companyId).toBe(user.companyId);
    });
  });

  describe('register -> login flow', () => {
    it('should register and return valid tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const company = createTestCompany();
      prisma.company.create.mockResolvedValue(company);
      const user = createTestUser({ companyId: company.id, tenantId: company.id });
      prisma.user.create.mockResolvedValue(user);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await authService.register({
        email: 'new@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        companyName: 'New Co',
        role: 'ADMIN',
      });

      const decoded = jwtService.verify(result.access_token);
      expect(decoded.sub).toBe(user.id);
      expect(decoded.tenantId).toBe(company.id);
    });
  });

  describe('refresh flow', () => {
    it('should issue new token pair from valid refresh token', async () => {
      const user = createTestUser();
      prisma.user.findFirst.mockResolvedValue(user);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      const initial = await authService.login({
        email: user.email,
        password: 'password123',
      });

      // Refresh uses JWT_REFRESH_SECRET env var, which defaults to 'dev-refresh-secret'
      const refreshed = await authService.refresh(initial.refresh_token);
      expect(refreshed.access_token).toBeDefined();
      expect(refreshed.refresh_token).toBeDefined();

      const decoded = jwtService.verify(refreshed.access_token);
      expect(decoded.sub).toBe(user.id);
    });
  });
});
