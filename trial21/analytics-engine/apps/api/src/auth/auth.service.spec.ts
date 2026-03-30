import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../infra/prisma.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock }; tenant: { create: jest.Mock } };
  let jwt: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      tenant: { create: jest.fn() },
    };
    jwt = { sign: jest.fn().mockReturnValue('mock-token'), verify: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'test@test.com', passwordHash: 'hashed', role: 'USER', tenantId: 't1',
        tenant: { id: 't1' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: '1', email: 'test@test.com' }),
        expect.objectContaining({ expiresIn: '1h' }),
      );
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login({ email: 'none@test.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'test@test.com', passwordHash: 'hashed', role: 'USER', tenantId: 't1',
        tenant: { id: 't1' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should call bcrypt.compare with correct arguments', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'test@test.com', passwordHash: 'hashed-pw', role: 'USER', tenantId: 't1',
        tenant: { id: 't1' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login({ email: 'test@test.com', password: 'mypass' });
      expect(bcrypt.compare).toHaveBeenCalledWith('mypass', 'hashed-pw');
    });
  });

  describe('register', () => {
    it('should create tenant and user on registration', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.tenant.create.mockResolvedValue({ id: 't1' });
      prisma.user.create.mockResolvedValue({
        id: '1', email: 'new@test.com', role: 'USER', tenantId: 't1',
      });

      const result = await service.register({
        email: 'new@test.com', password: 'password123', name: 'Test', tenantName: 'Org', role: 'USER',
      });
      expect(result).toHaveProperty('access_token');
      expect(prisma.tenant.create).toHaveBeenCalledWith(expect.objectContaining({ data: { name: 'Org' } }));
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' });
      await expect(service.register({
        email: 'dup@test.com', password: 'password123', name: 'Test', tenantName: 'Org', role: 'USER',
      })).rejects.toThrow(ConflictException);
    });

    it('should hash password with correct salt rounds', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.tenant.create.mockResolvedValue({ id: 't1' });
      prisma.user.create.mockResolvedValue({
        id: '1', email: 'new@test.com', role: 'USER', tenantId: 't1',
      });

      await service.register({
        email: 'new@test.com', password: 'mypassword', name: 'Test', tenantName: 'Org', role: 'USER',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 12);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh token', async () => {
      jwt.verify.mockReturnValue({ sub: '1', email: 'test@test.com', role: 'USER', tenantId: 't1' });
      const result = await service.refresh('valid-refresh-token');
      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
