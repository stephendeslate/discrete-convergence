import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  tenant: {
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const hash = await bcrypt.hash('password', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@test.com', passwordHash: hash,
        role: 'USER', tenantId: 't1',
      });

      const result = await service.login('test@test.com', 'password');
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('password', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@test.com', passwordHash: hash,
        role: 'USER', tenantId: 't1',
      });

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login('no@test.com', 'pw')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create tenant and user', async () => {
      mockPrisma.tenant.create.mockResolvedValue({ id: 't1', name: 'Test' });
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1', email: 'new@test.com', role: 'USER', tenantId: 't1',
      });

      const result = await service.register('new@test.com', 'pass', 'Test', 'USER');
      expect(result.accessToken).toBe('mock-token');
      expect(mockPrisma.tenant.create).toHaveBeenCalled();
    });
  });
});
