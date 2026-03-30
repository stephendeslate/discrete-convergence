// TRACED:AE-AUTH-006 — Negative and edge case tests for authentication
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService — negative and edge cases', () => {
  let authService: AuthService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockImplementation(
      (payload: Record<string, unknown>, opts?: { expiresIn: string }) => {
        const expiry = opts?.expiresIn ?? '15m';
        return `token.${payload['sub']}.${expiry}`;
      },
    ),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login — negative cases', () => {
    it('should throw UnauthorizedException when email does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.login('nonexistent@test.com', 'password'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with correct message for invalid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.login('x@x.com', 'p'))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw for correct email but wrong password', async () => {
      const hash = await bcrypt.hash('correctPassword', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(authService.login('user@test.com', 'wrongPassword'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw for empty password against valid hash', async () => {
      const hash = await bcrypt.hash('realPassword', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(authService.login('user@test.com', ''))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('register — edge cases', () => {
    it('should hash password with bcrypt (not store plaintext)', async () => {
      const password = 'myPassword123';
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-1',
        email: 'test@test.com',
        role: 'USER',
      });

      await authService.register({
        email: 'test@test.com',
        password,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      // Password hash must not be the plaintext
      expect(createCall.data.passwordHash).not.toBe(password);
      // Must be a bcrypt hash (starts with $2b$ or $2a$)
      expect(createCall.data.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    it('should propagate database errors on duplicate email', async () => {
      mockPrisma.user.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email`)'),
      );

      await expect(
        authService.register({
          email: 'dupe@test.com',
          password: 'password123',
          role: 'USER',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow('Unique constraint');
    });

    it('should return only id, email, role — not passwordHash', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-1',
        email: 'test@test.com',
        role: 'USER',
        passwordHash: '$2b$12$somehash',
        tenantId: 'tenant-1',
      });

      const result = await authService.register({
        email: 'test@test.com',
        password: 'password123',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      // Response must not contain passwordHash
      expect(result).toEqual({ id: 'u-1', email: 'test@test.com', role: 'USER' });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('tenantId');
    });
  });

  describe('refresh — negative cases', () => {
    it('should throw when refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(authService.refresh('invalid-token'))
        .rejects
        .toThrow('invalid signature');
    });

    it('should throw when refresh token is expired', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(authService.refresh('expired-token'))
        .rejects
        .toThrow('jwt expired');
    });

    it('should issue new token pair with same payload from valid refresh', async () => {
      const payload = {
        sub: 'user-1',
        email: 'user@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      };
      mockJwtService.verify.mockReturnValue(payload);

      const result = await authService.refresh('valid-refresh-token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // Verify sign was called twice (access + refresh)
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      // First call: access token payload
      expect(mockJwtService.sign.mock.calls[0][0]).toEqual({
        sub: 'user-1',
        email: 'user@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });
    });
  });
});
