import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService } from './helpers/test-utils';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof mockPrismaService>;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = mockPrismaService();
    jwtService = { sign: jest.fn().mockReturnValue('mock-jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      const mockUser = {
        id: 'u1',
        email: 'test@test.com',
        passwordHash,
        role: 'viewer',
        tenantId: 't1',
      };
      prisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'u1',
          email: 'test@test.com',
          role: 'viewer',
          tenantId: 't1',
        }),
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'bad@test.com' },
      });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash,
        role: 'viewer',
        tenantId: 't1',
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'new@test.com',
        role: 'viewer',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        role: 'viewer',
        tenantId: 't1',
      });

      expect(result.email).toBe('new@test.com');
      expect(result.role).toBe('viewer');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new@test.com',
            tenantId: 't1',
          }),
        }),
      );
    });

    it('should throw ConflictException for duplicate user', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'exists@test.com',
          password: 'test123',
          role: 'viewer',
          tenantId: 't1',
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'exists@test.com', tenantId: 't1' },
      });
    });
  });
});
