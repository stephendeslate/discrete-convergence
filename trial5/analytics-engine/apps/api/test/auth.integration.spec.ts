import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload: Record<string, unknown>, opts?: { expiresIn: string }) => {
              // Produce a deterministic but distinct token based on payload and options
              const expiry = opts?.expiresIn ?? '15m';
              return `token.${payload['sub']}.${expiry}`;
            }),
            verify: jest.fn().mockImplementation((token: string) => {
              const parts = token.split('.');
              return { sub: parts[1], email: 'test@test.com', role: 'USER', tenantId: 'tenant-1' };
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should hash password and create user with correct role', async () => {
      const dto = { email: 'user@test.com', password: 'password123', role: 'USER', tenantId: 'tenant-1' };
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        role: dto.role,
        tenantId: dto.tenantId,
        passwordHash: '$2b$12$hashed',
      });

      const result = await authService.register(dto);

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('user@test.com');
      expect(result.role).toBe('USER');
      // Verify bcrypt was used: password in create call should be a hash, not the plaintext
      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).not.toBe('password123');
      expect(createCall.data.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    it('should pass tenantId from DTO to database', async () => {
      const dto = { email: 'u@t.com', password: 'password123', role: 'VIEWER', tenantId: 'tenant-42' };
      mockPrisma.user.create.mockResolvedValue({ id: 'u-1', email: dto.email, role: dto.role });

      await authService.register(dto);

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.tenantId).toBe('tenant-42');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.login('nope@test.com', 'password')).rejects.toThrow('Invalid credentials');
    });

    it('should return access and refresh tokens with different expiry', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('password123', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await authService.login('user@test.com', 'password123');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // Access token uses default expiry (15m), refresh token uses 7d
      expect(result.accessToken).toContain('15m');
      expect(result.refreshToken).toContain('7d');
    });

    it('should reject wrong password', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('correctPassword', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(authService.login('user@test.com', 'wrongPassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('should issue new token pair from valid refresh token', async () => {
      const result = await authService.refresh('token.user-1.7d');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(jwtService.verify).toHaveBeenCalledWith('token.user-1.7d');
    });
  });
});
