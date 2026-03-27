// TRACED: EM-AUTH-001 — Auth service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const dto = { email: 'test@test.com', password: 'password123', tenantId: 'tenant-1' };

    it('should register a new user and return access token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        tenantId: dto.tenantId,
        role: 'MEMBER',
      });

      const result = await service.register(dto);

      expect(result).toEqual({ accessToken: 'test-token' });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
    });

    it('should throw ConflictException if user exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should hash password with 12 salt rounds', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: dto.email, tenantId: dto.tenantId, role: 'MEMBER',
      });

      await service.register(dto);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });
  });

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'password123' };

    it('should return access token for valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1', email: dto.email, passwordHash: 'hashed',
        tenantId: 'tenant-1', role: 'MEMBER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);
      expect(result).toEqual({ accessToken: 'test-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1', email: dto.email, passwordHash: 'hashed',
        tenantId: 'tenant-1', role: 'MEMBER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('edge cases', () => {
    it('should throw conflict for duplicate email registration', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'dup@test.com', password: 'pass123', tenantId: 'tenant-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw unauthorized error for invalid credentials on login', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noone@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
