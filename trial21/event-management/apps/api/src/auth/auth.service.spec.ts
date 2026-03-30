import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com', passwordHash: hash,
        role: 'ATTENDEE', organizationId: 'org1',
      });

      const result = await service.login({ email: 'test@example.com', password: 'password123' });
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('should reject invalid email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'wrong@example.com' } });
    });

    it('should reject wrong password', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('correct', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com', passwordHash: hash,
        role: 'ATTENDEE', organizationId: 'org1',
      });
      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u2', email: 'new@example.com', role: 'ATTENDEE', organizationId: 'org1',
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        organizationId: 'org1',
        role: 'ATTENDEE',
      });
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(
        service.register({
          email: 'dup@example.com', password: 'password123',
          firstName: 'A', lastName: 'B', organizationId: 'org1', role: 'ATTENDEE',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({
        sub: 'u1', email: 'test@example.com', role: 'ATTENDEE', organizationId: 'org1',
      });
      const result = await service.refresh('valid-refresh-token');
      expect(result.access_token).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
