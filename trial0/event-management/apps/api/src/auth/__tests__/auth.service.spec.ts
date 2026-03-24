// TRACED:EM-TEST-007 — Auth service unit tests with mocked Prisma
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockPrisma = {
  user: { findFirst: vi.fn(), create: vi.fn() },
  organization: { findFirst: vi.fn(), create: vi.fn() },
};

const mockJwt = { sign: vi.fn().mockReturnValue('mock-token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(mockPrisma as never, mockJwt as unknown as JwtService);
  });

  it('should register a new user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1' });
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      role: 'ATTENDEE',
      organizationId: 'org-1',
    });

    const result = await service.register({
      email: 'test@test.com',
      name: 'Test',
      password: 'pass123',
      role: 'ATTENDEE',
    });

    expect(result.accessToken).toBe('mock-token');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('should throw ConflictException on duplicate email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        email: 'test@test.com',
        name: 'Test',
        password: 'pass123',
        role: 'ATTENDEE',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException on invalid credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
