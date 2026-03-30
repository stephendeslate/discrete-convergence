import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED:AE-TEST-002
describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    jwtService = { sign: jest.fn().mockReturnValue('test-jwt-token') };

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
    it('should register a new user and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'USER',
      });

      expect(result.accessToken).toBe('test-jwt-token');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User',
          tenantId: 'tenant-1',
          role: 'USER',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should use BCRYPT_SALT_ROUNDS from shared package', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      let capturedHash = '';
      prisma.user.create.mockImplementation(async (args: { data: { passwordHash: string } }) => {
        capturedHash = args.data.passwordHash;
        return {
          id: 'user-1',
          email: 'test@example.com',
          role: 'USER',
          tenantId: 'tenant-1',
        };
      });

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'USER',
      });

      // Verify BCRYPT_SALT_ROUNDS is 12 (from shared) and hash is valid
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
      const rounds = bcrypt.getRounds(capturedHash);
      expect(rounds).toBe(BCRYPT_SALT_ROUNDS);
      const isValid = await bcrypt.compare('password123', capturedHash);
      expect(isValid).toBe(true);
    });
  });

  describe('login', () => {
    it('should login and return token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        role: 'USER',
        tenantId: 'tenant-1',
        tenant: { id: 'tenant-1', name: 'Test' },
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('test-jwt-token');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        role: 'USER',
        tenantId: 'tenant-1',
        tenant: { id: 'tenant-1', name: 'Test' },
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid id', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.validateUser('user-1');
      expect(result).toEqual(
        expect.objectContaining({ id: 'user-1', email: 'test@example.com' }),
      );
    });

    it('should return null for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('non-existent');
      expect(result).toBeNull();
    });
  });
});
