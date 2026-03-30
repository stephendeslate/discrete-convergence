import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a user with hashed password', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'ORGANIZER',
        tenantId: 'tenant-1',
      };

      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        role: dto.role,
        tenantId: dto.tenantId,
      });

      const result = await service.register(dto);
      expect(result.email).toBe(dto.email);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          role: dto.role,
          tenantId: dto.tenantId,
        }),
      });
    });

    it('should use BCRYPT_SALT_ROUNDS from shared for password hashing', async () => {
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'ORGANIZER',
      });

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        role: 'ORGANIZER',
        tenantId: 'tenant-1',
      });

      const createCall = prisma.user.create.mock.calls[0][0];
      const storedHash = createCall.data.passwordHash;
      // Verify the password was hashed (not stored as plaintext)
      expect(storedHash).not.toBe('password123');
      // Verify it's a valid bcrypt hash with cost factor from BCRYPT_SALT_ROUNDS (12)
      expect(storedHash).toMatch(/^\$2[ab]\$12\$/);
      // Verify the hash validates against the original password
      const isValid = await bcrypt.compare('password123', storedHash);
      expect(isValid).toBe(true);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'ORGANIZER',
        tenantId: 'tenant-1',
      });

      const result = await service.login('test@example.com', 'password123');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login('nonexistent@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: '$2a$12$invalidhash',
        role: 'ORGANIZER',
        tenantId: 'tenant-1',
      });

      await expect(service.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'ORGANIZER',
        tenantId: 'tenant-1',
      });

      const result = await service.refresh('valid-refresh-token');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw when refresh token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refresh('invalid-token')).rejects.toThrow();
      expect(jwtService.verify).toHaveBeenCalledWith('invalid-token');
    });
  });
});
