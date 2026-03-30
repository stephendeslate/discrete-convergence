import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import * as bcrypt from 'bcrypt';

// TRACED:AE-TST-005 — auth unit tests import BCRYPT_SALT_ROUNDS from shared
describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('test-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should throw UnauthorizedException for invalid email', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.login({ email: 'bad@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    const hash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      passwordHash: hash,
      role: 'USER',
      tenantId: 't1',
    });
    await expect(
      service.login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return access token for valid credentials', async () => {
    const hash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      passwordHash: hash,
      role: 'USER',
      tenantId: 't1',
    });

    const result = await service.login({
      email: 'test@test.com',
      password: 'correct',
    });
    expect(result.accessToken).toBe('test-token');
    expect(jwtService.sign).toHaveBeenCalled();
  });

  it('should register a user', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'u2',
      email: 'new@test.com',
      role: 'USER',
    });

    const result = await service.register({
      email: 'new@test.com',
      password: 'password123',
      name: 'Test User',
      tenantId: 't1',
      role: 'USER',
    });
    expect(result.email).toBe('new@test.com');
  });

  it('should validate a user by ID', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      role: 'USER',
      tenantId: 't1',
    });
    const result = await service.validateUser('u1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('u1');
  });

  it('should return null for nonexistent user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    const result = await service.validateUser('nonexistent');
    expect(result).toBeNull();
  });
});
