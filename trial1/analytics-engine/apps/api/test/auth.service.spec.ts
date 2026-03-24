import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';

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
      verify: jest.fn().mockReturnValue({ sub: '1', email: 'a@b.com', role: 'EDITOR', tenantId: 't1' }),
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
  });

  it('should register a user', async () => {
    prisma.user.create.mockResolvedValue({ id: '1', email: 'a@b.com', role: 'EDITOR' });
    const result = await service.register({ email: 'a@b.com', password: 'password123', role: 'EDITOR', tenantId: 't1' });
    expect(result).toHaveProperty('id');
  });
});
