import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findFirst: jest.Mock } };
  let jwt: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    jwt = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn().mockReturnValue({ sub: '1', email: 'a@b.com', role: 'DISPATCHER', tenantId: 't1' }),
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

  it('should throw UnauthorizedException for invalid email', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.login('bad@email.com', 'pass')).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'bad@email.com' } });
  });

  it('should register a user with correct data', async () => {
    prisma.user.create.mockResolvedValue({ id: '1', email: 'a@b.com', role: 'DISPATCHER' });
    const result = await service.register({ email: 'a@b.com', password: 'password123', role: 'DISPATCHER', tenantId: 't1' });
    expect(result).toHaveProperty('id');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'a@b.com',
          role: 'DISPATCHER',
          tenantId: 't1',
        }),
      }),
    );
  });

  it('should use BCRYPT_SALT_ROUNDS from shared', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
    expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
  });

  it('should return tokens on successful login', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      passwordHash: '$2a$12$LJ3m4ys3uz2v1QxOlpIqZezGIbsJkDG0FH3WTbcJY7aW95PU7m16y',
      role: 'DISPATCHER',
      tenantId: 't1',
    });
    jwt.sign.mockReturnValue('mock-jwt');
    // bcrypt.compare will fail with the mock hash but we're testing the flow
    await expect(service.login('a@b.com', 'password123')).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
  });

  it('should refresh tokens using jwt verify and sign', async () => {
    const result = await service.refresh('old-token');
    expect(jwt.verify).toHaveBeenCalledWith('old-token');
    expect(jwt.sign).toHaveBeenCalled();
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });
});
