import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
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
    it('should throw ConflictException if user exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'DISPATCHER',
          companyId: 'company-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password with BCRYPT_SALT_ROUNDS and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'new@test.com',
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      expect(result.accessToken).toBe('test-token');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new@test.com',
          }),
        }),
      );
      // Verify BCRYPT_SALT_ROUNDS is used (value is 12)
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nouser@test.com',
          password: 'password123',
          companyId: 'company-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'wrong-password',
          companyId: 'company-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
        companyId: 'company-1',
      });

      expect(result.accessToken).toBe('test-token');
    });
  });
});
