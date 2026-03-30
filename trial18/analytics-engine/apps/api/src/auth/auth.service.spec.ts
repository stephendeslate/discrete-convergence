import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user when email is not taken', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1', email: 'test@test.com', role: 'VIEWER',
      });

      const result = await service.register({
        email: 'test@test.com', password: 'pass', tenantId: 't1', role: 'VIEWER',
      });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result.email).toBe('test@test.com');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'dup@test.com', password: 'pass', tenantId: 't1', role: 'VIEWER',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'dup@test.com' },
      });
    });

    it('should hash password with BCRYPT_SALT_ROUNDS from shared', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'VIEWER' });

      await service.register({
        email: 'a@b.com', password: 'mypassword', tenantId: 't1', role: 'VIEWER',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: 'hashed' }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should return access_token for valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'user@test.com', passwordHash: 'hashed', role: 'VIEWER', tenantId: 't1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({ email: 'user@test.com', password: 'pass' });

      expect(result.access_token).toBe('jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'u1', email: 'user@test.com' }),
      );
    });

    it('should throw UnauthorizedException for wrong email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'wrong@test.com' },
      });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'user@test.com', passwordHash: 'hashed', role: 'VIEWER', tenantId: 't1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
    });
  });

  describe('setTenantContext', () => {
    it('should call $executeRaw with tenant id', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(undefined);
      await service.setTenantContext('tenant-abc');
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
