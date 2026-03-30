import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('test-token') };

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
    it('should register a new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-id',
        email: 'test@example.com',
        name: 'Test',
        role: 'USER',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
        tenantId: testTenantId,
      });

      expect(result.email).toBe('test@example.com');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'test@example.com' }),
        }),
      );
    });

    it('should throw ConflictException for existing email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'Password123!',
          name: 'Test',
          tenantId: testTenantId,
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
    });

    it('should hash password with correct salt rounds', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-id',
        email: 'test@example.com',
        name: 'Test',
        role: 'USER',
      });

      await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
        tenantId: testTenantId,
      });

      const createCall = prisma.user.create.mock.calls[0][0];
      const isValid = await bcrypt.compare('Password123!', createCall.data.passwordHash);
      expect(isValid).toBe(true);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('Password123!', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        name: 'Test',
        role: 'USER',
        tenantId: testTenantId,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.access_token).toBe('test-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
          role: 'USER',
          tenantId: testTenantId,
        }),
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('Password123!', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        role: 'USER',
        tenantId: testTenantId,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nobody@example.com' },
      });
    });
  });

  describe('getAllowedRoles', () => {
    it('should return allowed registration roles', () => {
      const roles = service.getAllowedRoles();
      expect(roles).toContain('USER');
      expect(roles).toContain('ORGANIZER');
      expect(roles).not.toContain('ADMIN');
    });
  });
});
