// TRACED: FD-AUTH-001 — Auth service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs');

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  tenant: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      organizationName: 'Test Org',
    };

    it('should register a new user and return a token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        mockPrisma.tenant.findFirst.mockResolvedValue(null);
        mockPrisma.tenant.create.mockResolvedValue({ id: 'tenant-1', name: 'Test Org', slug: 'test-org' });
        mockPrisma.user.create.mockResolvedValue({
          id: 'user-1',
          email: 'test@example.com',
          role: 'admin',
          tenantId: 'tenant-1',
        });
        return fn(mockPrisma);
      });

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should use 12 salt rounds for bcrypt', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        mockPrisma.tenant.findFirst.mockResolvedValue(null);
        mockPrisma.tenant.create.mockResolvedValue({ id: 't1' });
        mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'test@example.com', role: 'admin', tenantId: 't1' });
        return fn(mockPrisma);
      });

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should return a token on valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        tenantId: 'tenant-1',
        role: 'admin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        tenantId: 'tenant-1',
        role: 'admin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return error for invalid credentials with empty email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login({ email: '', password: 'pass' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('edge cases', () => {
    it('should handle duplicate email registration conflict', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'dup@test.com', password: 'p', organizationName: 'Org' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle organization name with special characters for slug', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        mockPrisma.tenant.findFirst.mockResolvedValue(null);
        mockPrisma.tenant.create.mockResolvedValue({ id: 't1', slug: 'test---org' });
        mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'admin', tenantId: 't1' });
        return fn(mockPrisma);
      });

      const result = await service.register({ email: 'a@b.com', password: 'p', organizationName: 'Test---Org!!!' });

      expect(result.accessToken).toBeDefined();
    });

    it('should append timestamp to slug on duplicate tenant slug conflict', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'existing-tenant' });
        mockPrisma.tenant.create.mockResolvedValue({ id: 't2', slug: 'test-org-123' });
        mockPrisma.user.create.mockResolvedValue({ id: 'u2', email: 'b@c.com', role: 'admin', tenantId: 't2' });
        return fn(mockPrisma);
      });

      const result = await service.register({ email: 'b@c.com', password: 'p', organizationName: 'Test Org' });

      expect(result.accessToken).toBeDefined();
    });
  });
});
