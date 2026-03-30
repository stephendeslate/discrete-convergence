import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infra/prisma.service';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

jest.mock('bcryptjs');

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  tenant: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('test-token'),
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
    it('should hash password and create user with tenant', async () => {
      const dto = { email: 'test@example.com', password: 'Test1234!', name: 'Test', tenantId: 'tenant-1' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: dto.email, name: dto.name, role: 'USER', tenantId: 'tenant-1',
      });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Test1234!', BCRYPT_SALT_ROUNDS);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          password: 'hashed-password',
          tenantId: 'tenant-1',
        }),
      });
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw ConflictException on duplicate email', async () => {
      const dto = { email: 'test@example.com', password: 'Test1234!', name: 'Test', tenantId: 'tenant-1' };
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: dto.email, tenantId: 'tenant-1' },
      });
    });

    it('should create default tenant if no tenantId provided', async () => {
      const dto = { email: 'test@example.com', password: 'Test1234!', name: 'Test' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'default-tenant' });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: dto.email, name: dto.name, role: 'USER', tenantId: 'default-tenant',
      });

      const result = await service.register(dto);

      expect(mockPrisma.tenant.findFirst).toHaveBeenCalledWith({ where: { slug: 'default' } });
      expect(result.tenantId).toBe('default-tenant');
    });
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1', email: 'test@example.com', password: 'hashed', tenantId: 't1', role: 'USER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'Test1234!' });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1', email: 'test@example.com' }),
      );
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login({ email: 'bad@example.com', password: 'x' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'A', role: 'USER', tenantId: 't1',
      });

      const result = await service.getProfile('u1');

      expect(result.id).toBe('u1');
      expect(result.email).toBe('a@b.com');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
    });

    it('should throw NotFoundException for missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
