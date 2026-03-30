import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { mockPrismaService, TEST_TENANT_ID, TEST_USER_ID } from './helpers/setup';

describe('AuthService (integration)', () => {
  let authService: AuthService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('should return a JWT when credentials are valid', async () => {
      const hash = await bcrypt.hash('password123', 10);
      (prisma.user as unknown as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: TEST_USER_ID,
        email: 'test@example.com',
        passwordHash: hash,
        role: 'DISPATCHER',
        tenantId: TEST_TENANT_ID,
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('test-jwt-token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      (prisma.user as unknown as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: TEST_USER_ID,
        email: 'test@example.com',
        passwordHash: hash,
        role: 'DISPATCHER',
        tenantId: TEST_TENANT_ID,
      });

      await expect(
        authService.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      (prisma.user as unknown as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(
        authService.login('nobody@example.com', 'password'),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should create user and return JWT', async () => {
      (prisma.user as unknown as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
      (prisma.user as unknown as { create: jest.Mock }).create.mockResolvedValue({
        id: TEST_USER_ID,
        email: 'new@example.com',
        role: 'DISPATCHER',
        tenantId: TEST_TENANT_ID,
      });

      const result = await authService.register(
        'new@example.com',
        'password123',
        'New User',
        'DISPATCHER',
        TEST_TENANT_ID,
      );

      expect(result.accessToken).toBe('test-jwt-token');
      // Verify bcrypt hash was passed (not plain password)
      const createCall = (prisma.user as unknown as { create: jest.Mock }).create.mock.calls[0][0];
      expect(createCall.data.passwordHash).not.toBe('password123');
      expect(createCall.data.passwordHash.startsWith('$2')).toBe(true);
    });

    it('should throw ConflictException if user already exists', async () => {
      (prisma.user as unknown as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        id: TEST_USER_ID,
      });

      await expect(
        authService.register('existing@example.com', 'pass', 'User', 'DISPATCHER', TEST_TENANT_ID),
      ).rejects.toThrow('User already exists');
    });
  });
});
