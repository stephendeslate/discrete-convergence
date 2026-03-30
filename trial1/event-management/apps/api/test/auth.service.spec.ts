import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  const mockPrisma = {
    user: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    organization: { create: jest.fn() },
  };
  const mockJwt = { sign: jest.fn().mockReturnValue('token'), verify: jest.fn() };

  beforeEach(() => {
    service = new AuthService(mockPrisma as never, mockJwt as unknown as JwtService);
    jest.clearAllMocks();
  });

  it('throws ConflictException if email exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: '1' });
    await expect(service.register({ name: 'A', email: 'a@b.com', password: 'pass1234', role: 'ADMIN' })).rejects.toThrow(ConflictException);
  });

  it('throws UnauthorizedException on invalid credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('returns tokens on valid login', async () => {
    const user = { id: '1', email: 'a@b.com', passwordHash: 'hash', role: 'ADMIN', organizationId: 'org1' };
    mockPrisma.user.findFirst.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.login('a@b.com', 'pass');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });
});
