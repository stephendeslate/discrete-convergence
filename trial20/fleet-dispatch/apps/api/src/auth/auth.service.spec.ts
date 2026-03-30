import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
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
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  it('should register a new user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: '1', email: 'test@test.com', role: 'VIEWER', tenantId: 't1',
    });
    const result = await service.register({
      email: 'test@test.com', password: 'password123', role: 'VIEWER', tenantId: 't1',
    });
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    expect(result.access_token).toBeDefined();
  });

  it('should throw ConflictException if email exists', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@test.com' });
    await expect(
      service.register({ email: 'test@test.com', password: 'pass', role: 'VIEWER', tenantId: 't1' }),
    ).rejects.toThrow(ConflictException);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
  });

  it('should login with valid credentials', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    mockPrisma.user.findFirst.mockResolvedValue({
      id: '1', email: 'test@test.com', password: hash, role: 'VIEWER', tenantId: 't1',
    });
    const result = await service.login({ email: 'test@test.com', password: 'password123' });
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    expect(result.access_token).toBe('mock-token');
  });

  it('should throw UnauthorizedException for invalid email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.login({ email: 'bad@test.com', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'bad@test.com' } });
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('correct', 10);
    mockPrisma.user.findFirst.mockResolvedValue({
      id: '1', email: 'test@test.com', password: hash, role: 'VIEWER', tenantId: 't1',
    });
    await expect(
      service.login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
  });

  it('should refresh token for valid user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1', email: 'test@test.com', role: 'VIEWER', tenantId: 't1',
    });
    const result = await service.refreshToken('1');
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.access_token).toBe('mock-token');
  });

  it('should throw UnauthorizedException on refresh with invalid user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.refreshToken('bad-id')).rejects.toThrow(UnauthorizedException);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'bad-id' } });
  });
});
