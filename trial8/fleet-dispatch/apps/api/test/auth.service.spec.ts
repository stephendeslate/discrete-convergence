import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { LoggerService } from '../src/infra/logger.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
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
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // TRACED: FD-AUTH-009
  it('should login successfully with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'test@fleet.test',
      passwordHash,
      role: 'USER',
      tenantId: 't1',
    });

    const result = await service.login({ email: 'test@fleet.test', password: 'password123' });
    expect(result.access_token).toBe('test-token');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@fleet.test' } });
  });

  // TRACED: FD-AUTH-010
  it('should throw UnauthorizedException for non-existent user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.login({ email: 'none@fleet.test', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'none@fleet.test' } });
  });

  // TRACED: FD-AUTH-011
  it('should throw UnauthorizedException for wrong password', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'test@fleet.test',
      passwordHash: await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS),
      role: 'USER',
      tenantId: 't1',
    });

    await expect(service.login({ email: 'test@fleet.test', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@fleet.test' } });
  });

  // TRACED: FD-AUTH-012
  it('should register a new user successfully', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u2',
      email: 'new@fleet.test',
      role: 'USER',
      tenantId: 't1',
    });

    const result = await service.register({
      email: 'new@fleet.test',
      password: 'password123',
      role: 'USER',
      tenantId: 't1',
    });
    expect(result.access_token).toBe('test-token');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'new@fleet.test' } });
  });

  // TRACED: FD-AUTH-013
  it('should throw ConflictException for duplicate email', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(
      service.register({ email: 'dup@fleet.test', password: 'password123', role: 'USER', tenantId: 't1' }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'dup@fleet.test' } });
  });
});
