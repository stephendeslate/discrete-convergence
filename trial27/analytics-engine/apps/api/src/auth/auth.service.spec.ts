import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findFirst: jest.Mock; create: jest.Mock };
    tenant: { findFirst: jest.Mock; create: jest.Mock };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      tenant: { findFirst: jest.fn(), create: jest.fn() },
    };
    jwtService = { sign: jest.fn().mockReturnValue('mock-token') };

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
    it('should register a new user successfully', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', name: 'Acme' });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        tenantName: 'Acme',
      });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          tenantName: 'Acme',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new tenant if one does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.tenant.findFirst.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue({ id: 'new-tenant', name: 'NewOrg' });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        tenantId: 'new-tenant',
      });

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        tenantName: 'NewOrg',
      });

      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: { name: 'NewOrg' },
      });
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const hashed = await bcrypt.hash('password123', 12);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashed,
        name: 'Test',
        tenantId: 'tenant-1',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashed = await bcrypt.hash('password123', 12);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashed,
        name: 'Test',
        tenantId: 'tenant-1',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
