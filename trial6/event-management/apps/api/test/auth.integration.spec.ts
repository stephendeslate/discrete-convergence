import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';
import { mockPrismaService, resetMocks } from './helpers/setup';
import * as bcrypt from 'bcrypt';

describe('Auth Integration', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    resetMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should create user and return token with user data', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ORGANIZER',
        tenantId: 'tenant-1',
        passwordHash: 'hashed',
      });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'ORGANIZER',
        tenantId: 'tenant-1',
      });

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('ORGANIZER');
      expect(result.user.tenantId).toBe('tenant-1');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
          role: 'ORGANIZER',
          tenantId: 'tenant-1',
        }),
      );
    });

    it('should reject ADMIN registration', async () => {
      await expect(
        authService.register({
          email: 'admin@test.com',
          password: 'password',
          name: 'Admin',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject duplicate email', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(
        authService.register({
          email: 'existing@test.com',
          password: 'password',
          name: 'Test',
          role: 'VIEWER',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'VIEWER',
        tenantId: 'tenant-1',
        passwordHash: hash,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should reject invalid email', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      await expect(
        authService.login({ email: 'wrong@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
      });

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
