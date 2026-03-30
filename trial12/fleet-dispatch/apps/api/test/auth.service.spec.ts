import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn() };

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
      const dto = { email: 'test@test.com', password: 'pass123', name: 'Test', role: 'DRIVER', tenantId };
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({ id: '1', email: dto.email, role: dto.role });

      const result = await service.register(dto);

      expect(result.email).toBe(dto.email);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, BCRYPT_SALT_ROUNDS);
    });

    it('should throw ConflictException if email exists', async () => {
      const dto = { email: 'test@test.com', password: 'pass123', name: 'Test', role: 'DRIVER', tenantId };
      prisma.user.findFirst.mockResolvedValue({ id: '1', email: dto.email });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });

    it('should reject registration with ADMIN role', async () => {
      const dto = { email: 'admin@test.com', password: 'pass123', name: 'Admin', role: 'ADMIN', tenantId };
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const dto = { email: 'test@test.com', password: 'pass123' };
      const user = { id: '1', email: dto.email, password: 'hashed', role: 'DRIVER', tenantId };
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token123');

      const result = await service.login(dto);

      expect(result.access_token).toBe('token123');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
    });

    it('should throw UnauthorizedException for wrong email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login({ email: 'wrong@test.com', password: 'pass' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'wrong@test.com' } });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = { id: '1', email: 'test@test.com', password: 'hashed', role: 'DRIVER', tenantId };
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'DRIVER' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('1');

      expect(result.email).toBe(user.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'nonexistent' } });
    });
  });
});
