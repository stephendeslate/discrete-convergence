import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
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
    it('should register a new user and return token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'ATTENDEE',
        organizationId: 'org-1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'ATTENDEE',
        organizationId: 'org-1',
      });

      expect(result.accessToken).toBe('mock-token');
      expect(prisma.user.create).toHaveBeenCalled();
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.email).toBe('test@example.com');
    });

    it('should throw ConflictException if user exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing',
          role: 'ATTENDEE',
          organizationId: 'org-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject ADMIN role registration', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: 'ADMIN' as 'ORGANIZER',
          organizationId: 'org-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should use BCRYPT_SALT_ROUNDS from shared', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'ATTENDEE',
        organizationId: 'org-1',
      });

      const hashSpy = jest.spyOn(bcrypt, 'hash') as jest.SpyInstance;

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'ATTENDEE',
        organizationId: 'org-1',
      });

      expect(hashSpy).toHaveBeenCalledWith('password123', BCRYPT_SALT_ROUNDS);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'ATTENDEE',
        organizationId: 'org-1',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
        organizationId: 'org-1',
      });

      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'ATTENDEE',
        organizationId: 'org-1',
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
          organizationId: 'org-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nobody@example.com',
          password: 'password123',
          organizationId: 'org-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
